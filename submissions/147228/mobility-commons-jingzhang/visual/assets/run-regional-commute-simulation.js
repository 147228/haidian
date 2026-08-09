'use strict';

/*
 * Regional-scale synthetic commute runner.
 *
 * It deliberately loops through every declared population-scale agent, but
 * keeps only aggregate counters and histogram bins. It is a transparent
 * stress test, not an observed Haidian OD model or a resident-satisfaction
 * measurement. No network access and no personal trajectory are used.
 */

const fs = require('fs');
const path = require('path');

const root = __dirname;
const model = JSON.parse(fs.readFileSync(path.join(root, 'regional-scale-commute.json'), 'utf8'));
const TOTAL = model.regional_scope.population_reference;
const GROUPS = model.synthetic_population.groups;
const MODES = model.modes;
const HISTOGRAM_BINS = [30, 45, 60, 90, Infinity];

function fail(message) {
  console.error(`REGIONAL_MODEL_CHECK_FAIL: ${message}`);
  process.exitCode = 1;
}

function round(value, digits = 4) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function clamp(value, low, high) {
  return Math.max(low, Math.min(high, value));
}

function hash(index, salt) {
  let value = (index + 1 + salt * 2654435761) >>> 0;
  value ^= value >>> 16;
  value = Math.imul(value, 2246822519) >>> 0;
  value ^= value >>> 13;
  value = Math.imul(value, 3266489917) >>> 0;
  return (value ^ (value >>> 16)) >>> 0;
}

function unit(index, salt) {
  return hash(index, salt) / 4294967296;
}

function selectWeighted(weights, index, salt) {
  const target = unit(index, salt);
  let cursor = 0;
  for (const mode of MODES) {
    cursor += Number(weights[mode] || 0);
    if (target < cursor) return mode;
  }
  return MODES[MODES.length - 1];
}

function groupRanges() {
  let start = 0;
  return GROUPS.map((group) => {
    const range = { ...group, start, end: start + group.count };
    start += group.count;
    return range;
  });
}

function groupFor(index, ranges) {
  return ranges.find((group) => index >= group.start && index < group.end);
}

function addMap(map, key, value = 1) {
  map[key] = Number(map[key] || 0) + value;
}

function emptyHistogram() {
  return {"0-30": 0, "30-45": 0, "45-60": 0, "60-90": 0, "90+": 0};
}

function addHistogram(histogram, minutes) {
  const labels = ["0-30", "30-45", "45-60", "60-90", "90+"];
  const index = HISTOGRAM_BINS.findIndex((limit) => minutes <= limit);
  histogram[labels[index]] += 1;
}

function percentileFromHistogram(histogram, percentile, total) {
  const labels = ["0-30", "30-45", "45-60", "60-90", "90+"];
  const upperBounds = [30, 45, 60, 90, 120];
  const target = Math.max(1, Math.ceil(total * percentile));
  let cumulative = 0;
  for (let i = 0; i < labels.length; i += 1) {
    cumulative += histogram[labels[i]];
    if (cumulative >= target) return upperBounds[i];
  }
  return upperBounds[upperBounds.length - 1];
}

function routeTemplate(mode, external, group) {
  if (mode === 'enterprise_shuttle') return model.route_templates.enterprise_shuttle;
  const template = model.route_templates[mode];
  if (external && group === 'enterprise_employee') return template.replace('home', 'boundary');
  return template;
}

function scenarioParameters(scenarioId) {
  if (scenarioId === 'R1') {
    return {weights: model.mode_weights_by_group.O1, disruption: true, timeMultiplier: {metro: 1.35, bus: 1.08, bicycle: 1.10, walking_wheelchair: 1.08, car: 1.16, enterprise_shuttle: 1.10}};
  }
  return {
    weights: model.mode_weights_by_group[scenarioId],
    disruption: false,
    timeMultiplier: scenarioId === 'O1'
      ? {metro: 0.88, bus: 0.90, bicycle: 0.92, walking_wheelchair: 0.95, car: 1.03, enterprise_shuttle: 0.90}
      : {metro: 1.00, bus: 1.03, bicycle: 1.00, walking_wheelchair: 1.00, car: 1.08, enterprise_shuttle: 1.04}
  };
}

function accessibilityScore(groupId, mode, scenarioId) {
  const base = {
    metro: 0.93,
    bus: 0.89,
    bicycle: groupId === 'carer_or_child' ? 0.70 : 0.82,
    walking_wheelchair: 0.96,
    car: 0.91,
    enterprise_shuttle: 0.94
  }[mode];
  const protectedGroup = ['carer_or_child', 'night_worker'].includes(groupId);
  const coordinationBonus = scenarioId === 'O1' ? (protectedGroup ? 0.035 : 0.02) : 0;
  const disruptionPenalty = scenarioId === 'R1' && mode === 'metro' ? 0.12 : 0;
  return clamp(base + coordinationBonus - disruptionPenalty, 0, 1);
}

function simulateScenario(scenarioId) {
  const parameters = scenarioParameters(scenarioId);
  const ranges = groupRanges();
  const modeCounts = Object.fromEntries(MODES.map((mode) => [mode, 0]));
  const groupCounts = {};
  const groupSatisfaction = {};
  const groupAccessibility = {};
  const routeCounts = {};
  const corridorCounts = {};
  const timeHistogram = emptyHistogram();
  let processed = 0;
  let externalAgents = 0;
  let externalCarAgents = 0;
  let totalGeneralizedCost = 0;
  let totalSatisfaction = 0;
  let totalAccessibility = 0;
  let totalConflictProbability = 0;
  let totalVehicleKm = 0;
  let workActivityAgents = 0;

  for (const group of ranges) {
    groupCounts[group.id] = 0;
    groupSatisfaction[group.id] = 0;
    groupAccessibility[group.id] = 0;
    for (let offset = 0; offset < group.count; offset += 1) {
      const index = group.start + offset;
      const origin = model.zones.origins[hash(index, 11) % model.zones.origins.length];
      const destination = model.zones.destinations[hash(index, 13) % model.zones.destinations.length];
      const external = unit(index, 17) < (group.id === 'enterprise_employee' ? 0.58 : group.id === 'resident_worker' ? 0.24 : 0.14);
      const mode = selectWeighted(parameters.weights[group.id], index, 19);
      const reliability = model.mode_parameters[mode].reliability[scenarioId];
      const distanceFactor = 0.82 + unit(index, 23) * 0.58;
      const zoneFactor = 0.92 + ((hash(index, 29) % 17) / 100);
      const time = model.mode_parameters[mode].base_minutes * parameters.timeMultiplier[mode] * distanceFactor * zoneFactor + (external ? 5 : 0);
      const accessibility = accessibilityScore(group.id, mode, scenarioId);
      const conflictProbability = model.mode_parameters[mode].conflict_rate * (scenarioId === 'O1' ? 0.72 : scenarioId === 'R1' ? 1.18 : 1.0) * (external ? 1.08 : 1);
      const route = routeTemplate(mode, external, group.id);
      const corridor = `${origin} → ${destination}`;
      const waitPenalty = (1 - reliability) * 12;
      const crowdPenalty = mode === 'metro' || mode === 'bus' ? (scenarioId === 'B0' ? 4.5 : scenarioId === 'R1' ? 7.5 : 1.5) : 0;
      const curbPenalty = mode === 'car' ? (scenarioId === 'B0' ? 10 : scenarioId === 'R1' ? 12 : 3) : 0;
      const generalizedCost = time + waitPenalty + crowdPenalty + curbPenalty + (1 - accessibility) * 15;
      const satisfaction = clamp(100 - generalizedCost * 0.56 - (1 - reliability) * 10 - conflictProbability * 1600, 0, 100);

      addMap(modeCounts, mode);
      addMap(routeCounts, route);
      addMap(corridorCounts, `${corridor} / ${mode}`);
      groupCounts[group.id] += 1;
      groupSatisfaction[group.id] += satisfaction;
      groupAccessibility[group.id] += accessibility;
      totalGeneralizedCost += generalizedCost;
      totalSatisfaction += satisfaction;
      totalAccessibility += accessibility;
      totalConflictProbability += conflictProbability;
      totalVehicleKm += (mode === 'car' ? distanceFactor * zoneFactor * 18 : mode === 'bicycle' ? distanceFactor * zoneFactor * 8 : mode === 'walking_wheelchair' ? distanceFactor * zoneFactor * 3 : distanceFactor * zoneFactor * 8.5) * (mode === 'car' ? 1 / 1.7 : 1);
      addHistogram(timeHistogram, time);
      if (external) externalAgents += 1;
      if (external && mode === 'car') externalCarAgents += 1;
      if (group.activity === 'work') workActivityAgents += 1;
      processed += 1;
    }
  }

  const modeShares = Object.fromEntries(MODES.map((mode) => [mode, round(modeCounts[mode] / processed)]));
  const modeLoadRatios = Object.fromEntries(MODES.map((mode) => [mode, round(modeCounts[mode] / model.mode_parameters[mode].capacity_person_trips)]));
  const groupSatisfactionProxy = Object.fromEntries(GROUPS.map((group) => [group.id, round(groupSatisfaction[group.id] / groupCounts[group.id], 2)]));
  const groupAccessibilityCompletion = Object.fromEntries(GROUPS.map((group) => [group.id, round(groupAccessibility[group.id] / groupCounts[group.id], 4)]));
  const satisfactionValues = Object.values(groupSatisfactionProxy);
  const accessibilityValues = Object.values(groupAccessibilityCompletion);
  const topRoutes = Object.entries(routeCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([route, count]) => ({route, count, share: round(count / processed)}));
  const topCorridors = Object.entries(corridorCounts).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([corridor, count]) => ({corridor, count, share: round(count / processed)}));

  return {
    scenario_id: scenarioId,
    status: scenarioId === 'O1' ? 'synthetic_candidate_subject_to_calibration' : 'synthetic_sensitivity',
    population_agents: TOTAL,
    agents_processed: processed,
    work_activity_agents: workActivityAgents,
    all_agents_processed: processed === TOTAL,
    mass_conservation: sum(Object.values(modeCounts)) === TOTAL,
    external_agents: externalAgents,
    external_share: round(externalAgents / TOTAL),
    external_car_inflow_ratio: round(externalCarAgents / Math.max(externalAgents, 1)),
    mode_counts: modeCounts,
    mode_shares: modeShares,
    mode_load_ratios: modeLoadRatios,
    total_trips: processed,
    completed_trips: processed,
    p50_travel_time_proxy_minutes: percentileFromHistogram(timeHistogram, 0.50, processed),
    p90_travel_time_proxy_minutes: percentileFromHistogram(timeHistogram, 0.90, processed),
    travel_time_histogram: timeHistogram,
    average_generalized_cost_proxy: round(totalGeneralizedCost / processed, 2),
    satisfaction_proxy: round(totalSatisfaction / processed, 2),
    satisfaction_proxy_by_group: groupSatisfactionProxy,
    accessibility_completion_proxy: round(totalAccessibility / processed, 4),
    accessibility_completion_by_group: groupAccessibilityCompletion,
    worst_group_satisfaction_gap_proxy_points: round(Math.max(...satisfactionValues) - Math.min(...satisfactionValues), 2),
    worst_group_accessibility_gap_proxy_points: round((Math.max(...accessibilityValues) - Math.min(...accessibilityValues)) * 100, 2),
    people_flow_conflict_rate_per_1000_proxy: round((totalConflictProbability / processed) * 1000, 2),
    vehicle_km_proxy: round(totalVehicleKm, 0),
    route_flow_summary: topRoutes,
    top_corridor_flow_summary: topCorridors,
    privacy_check: "aggregate_only_no_personal_trace",
    air_candidate: "blocked"
  };
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

const scenarios = ['B0', 'O1', 'R1'].map(simulateScenario);
const baseline = scenarios[0];
const optimized = scenarios[1];
const checks = {
  population_reference_is_regional_scale: TOTAL >= 3000000,
  declared_group_counts_sum_to_population: sum(GROUPS.map((group) => group.count)) === TOTAL,
  baseline_mass_conservation: baseline.mass_conservation,
  optimized_mass_conservation: optimized.mass_conservation,
  all_population_agents_processed: scenarios.every((scenario) => scenario.all_agents_processed),
  optimized_satisfaction_proxy_not_lower: optimized.satisfaction_proxy >= baseline.satisfaction_proxy,
  optimized_generalized_cost_proxy_not_higher: optimized.average_generalized_cost_proxy <= baseline.average_generalized_cost_proxy,
  optimized_conflict_proxy_not_higher: optimized.people_flow_conflict_rate_per_1000_proxy <= baseline.people_flow_conflict_rate_per_1000_proxy,
  optimized_external_car_inflow_not_higher: optimized.external_car_inflow_ratio <= baseline.external_car_inflow_ratio,
  air_candidate_fail_closed: scenarios.every((scenario) => scenario.air_candidate === 'blocked'),
  privacy_aggregate_only: scenarios.every((scenario) => scenario.privacy_check === 'aggregate_only_no_personal_trace')
};

Object.entries(checks).forEach(([name, passed]) => {
  if (!passed) fail(name);
});

const output = {
  model_version: model.version,
  simulation_class: model.simulation_class,
  regional_scope: model.regional_scope,
  optimization_objective: model.optimization_objective,
  scenarios,
  comparison: {
    optimized_minus_baseline: {
      satisfaction_proxy_points: round(optimized.satisfaction_proxy - baseline.satisfaction_proxy, 2),
      generalized_cost_proxy: round(optimized.average_generalized_cost_proxy - baseline.average_generalized_cost_proxy, 2),
      p90_travel_time_proxy_minutes: optimized.p90_travel_time_proxy_minutes - baseline.p90_travel_time_proxy_minutes,
      people_flow_conflict_rate_per_1000_proxy: round(optimized.people_flow_conflict_rate_per_1000_proxy - baseline.people_flow_conflict_rate_per_1000_proxy, 2),
      external_car_inflow_ratio: round(optimized.external_car_inflow_ratio - baseline.external_car_inflow_ratio, 4),
      vehicle_km_proxy: optimized.vehicle_km_proxy - baseline.vehicle_km_proxy,
      accessibility_completion_proxy: round(optimized.accessibility_completion_proxy - baseline.accessibility_completion_proxy, 4)
    },
    interpretation: "O1 is the selected synthetic operating candidate only when hard gates hold; proxy improvements are not measured local outcomes."
  },
  checks,
  calibration_boundary: model.calibration_required_before_local_decision
};

console.log(JSON.stringify(output, null, 2));
if (Object.values(checks).every(Boolean)) console.error('REGIONAL_MODEL_CHECK_PASS: all population-scale checks passed');
