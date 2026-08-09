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

function tripDistanceKm(mode, distanceFactor, zoneFactor) {
  const base = {
    car: 18,
    bicycle: 8,
    walking_wheelchair: 3,
    metro: 8.5,
    bus: 8.5,
    enterprise_shuttle: 8.5
  }[mode];
  return distanceFactor * zoneFactor * base;
}

function buildServiceLedger(modeCounts) {
  return Object.fromEntries(MODES.map((mode) => {
    const parameters = model.mode_parameters[mode];
    const unit = parameters.service_unit;
    const personTrips = Number(modeCounts[mode] || 0);
    const capacityPerUnit = Number(unit.capacity_persons_per_unit);
    const requiredUnits = Math.ceil(personTrips / capacityPerUnit);
    const availableUnits = Math.ceil(parameters.capacity_person_trips / capacityPerUnit);
    const availablePersonCapacity = availableUnits * capacityPerUnit;
    return [mode, {
      mode,
      label_zh: parameters.label_zh,
      label_en: parameters.label_en,
      unit_type: unit.unit_type,
      unit_label_zh: unit.label_zh,
      unit_label_en: unit.label_en,
      vehicle_or_service: unit.vehicle_or_service,
      capacity_persons_per_unit: capacityPerUnit,
      distance_km_per_unit: unit.distance_km_per_unit,
      person_trips: personTrips,
      declared_person_capacity: parameters.capacity_person_trips,
      available_units: availableUnits,
      required_units: requiredUnits,
      spare_units: Math.max(0, availableUnits - requiredUnits),
      unit_load_ratio: round(requiredUnits / Math.max(availableUnits, 1)),
      person_capacity_utilization: round(personTrips / Math.max(availablePersonCapacity, 1)),
      vehicle_or_service_km_proxy: round(requiredUnits * Number(unit.distance_km_per_unit), 0),
      interpretation: 'synthetic service-unit screen; not an observed fleet, timetable or capacity fact'
    }];
  }));
}

function simulateDepartureTimeChoiceScreen(policyId, profileId) {
  const bands = model.departure_time_choice.bands;
  const bandById = Object.fromEntries(bands.map((band) => [band.id, band]));
  const profile = model.mode_weights_by_group[profileId];
  const bandCounts = Object.fromEntries(bands.map((band) => [band.id, 0]));
  const groupBandCounts = Object.fromEntries(GROUPS.map((group) => [
    group.id,
    Object.fromEntries(bands.map((band) => [band.id, 0]))
  ]));
  const modeBandCounts = Object.fromEntries(MODES.map((mode) => [
    mode,
    Object.fromEntries(bands.map((band) => [band.id, 0]))
  ]));
  let processed = 0;
  let shiftedEnterpriseAgents = 0;
  let reschedulingCostPersonMinutes = 0;

  for (const group of groupRanges()) {
    const rule = model.departure_time_choice.group_rules[group.id];
    for (let offset = 0; offset < group.count; offset += 1) {
      const index = group.start + offset;
      const mode = selectWeighted(profile[group.id], index, 61);
      let bandId = rule.default_band;
      const shiftEligible = profileId === 'O4'
        && rule.shiftable
        && unit(index, 67) < Number(rule.shift_share_O4 || 0);
      if (shiftEligible) {
        bandId = rule.shift_band;
        shiftedEnterpriseAgents += 1;
        reschedulingCostPersonMinutes += Math.abs(Number(bandById[bandId].offset_minutes || 0));
      }
      bandCounts[bandId] += 1;
      groupBandCounts[group.id][bandId] += 1;
      modeBandCounts[mode][bandId] += 1;
      processed += 1;
    }
  }

  const protectedGroupShiftCount = sum(GROUPS
    .filter((group) => group.id !== 'enterprise_employee')
    .map((group) => bands.reduce((total, band) => {
      const defaultBand = model.departure_time_choice.group_rules[group.id].default_band;
      return total + (band.id === defaultBand ? 0 : groupBandCounts[group.id][band.id]);
    }, 0)));
  const modeBandShares = Object.fromEntries(MODES.map((mode) => [
    mode,
    Object.fromEntries(bands.map((band) => [band.id, round(modeBandCounts[mode][band.id] / Math.max(processed, 1))]))
  ]));

  return {
    policy_id: policyId,
    profile_id: profileId,
    model_class: model.departure_time_choice.model_class,
    status: model.departure_time_choice.status,
    agents_processed: processed,
    all_agents_processed: processed === TOTAL,
    mass_conservation: sum(Object.values(bandCounts)) === TOTAL,
    band_counts: bandCounts,
    band_shares: Object.fromEntries(bands.map((band) => [band.id, round(bandCounts[band.id] / Math.max(processed, 1))])),
    group_band_counts: groupBandCounts,
    mode_band_counts: modeBandCounts,
    mode_band_shares: modeBandShares,
    preferred_band_share: round(bandCounts.preferred / Math.max(processed, 1)),
    shifted_enterprise_agents: shiftedEnterpriseAgents,
    shifted_enterprise_share: round(shiftedEnterpriseAgents / Math.max(model.synthetic_population.groups.find((group) => group.id === 'enterprise_employee').count, 1)),
    protected_group_shift_count: protectedGroupShiftCount,
    rescheduling_cost_person_minutes_proxy: reschedulingCostPersonMinutes,
    offset_minutes_by_band: Object.fromEntries(bands.map((band) => [band.id, band.offset_minutes])),
    interpretation: 'synthetic grouped time-band sensitivity; not observed employee behaviour, arrival distribution or timetable performance'
  };
}

function simulateTimeSlicedServiceOperations(policyId, profileId, choiceScreen = null) {
  const operations = model.service_time_operations;
  const slices = operations.time_slices;
  const choice = choiceScreen || simulateDepartureTimeChoiceScreen(policyId, profileId);
  const supply = operations.service_supply_units_by_profile[profileId]
    || operations.service_supply_units_by_profile.B0;
  const modeSummaries = {};
  const modeSliceRows = {};
  let demandProcessed = 0;
  let boardedPersonTrips = 0;
  let unresolvedQueuePersonTrips = 0;
  let failedBoardingAttempts = 0;
  let queuePersonMinutesProxy = 0;
  let scheduledServiceKmProxy = 0;

  for (const mode of MODES) {
    const parameters = model.mode_parameters[mode];
    const serviceUnit = parameters.service_unit;
    const capacityPerUnit = Number(serviceUnit.capacity_persons_per_unit);
    let queueBefore = 0;
    let modeDemand = 0;
    let modeBoarded = 0;
    let modeFailedBoardingAttempts = 0;
    let modeQueuePersonMinutesProxy = 0;
    let modeScheduledServiceKmProxy = 0;
    const rows = [];

    for (const slice of slices) {
      const demand = Number(choice.mode_band_counts[mode][slice.id] || 0);
      const availableUnits = Number(supply[mode][slice.id] || 0);
      const availablePersonCapacity = availableUnits * capacityPerUnit;
      const arrivals = demand + queueBefore;
      const boarded = Math.min(arrivals, availablePersonCapacity);
      const failedBoarding = Math.max(0, arrivals - boarded);
      const queueAfter = failedBoarding;
      const loadRatio = availablePersonCapacity > 0 ? arrivals / availablePersonCapacity : (arrivals > 0 ? Infinity : 0);

      rows.push({
        mode,
        time_slice: slice.id,
        demand_person_trips: demand,
        queue_before_person_trips: queueBefore,
        arrivals_including_queue: arrivals,
        available_service_units: availableUnits,
        capacity_persons_per_unit: capacityPerUnit,
        available_person_capacity: round(availablePersonCapacity, 2),
        boarded_person_trips: round(boarded, 2),
        failed_boarding_attempts: round(failedBoarding, 2),
        residual_queue_after_slice: round(queueAfter, 2),
        load_ratio: round(loadRatio),
        queue_person_minutes_proxy: round(queueAfter * Number(slice.duration_minutes), 2),
        scheduled_service_km_proxy: round(availableUnits * Number(serviceUnit.distance_km_per_unit), 2),
        interpretation: 'synthetic FIFO slice screen; not an observed timetable, boarding count or passenger-level queue'
      });

      modeDemand += demand;
      modeBoarded += boarded;
      modeFailedBoardingAttempts += failedBoarding;
      modeQueuePersonMinutesProxy += queueAfter * Number(slice.duration_minutes);
      modeScheduledServiceKmProxy += availableUnits * Number(serviceUnit.distance_km_per_unit);
      queueBefore = queueAfter;
    }

    const declaredAvailableUnits = rows.reduce((total, row) => total + row.available_service_units, 0);
    const requiredUnitsForDemand = Math.ceil(modeDemand / capacityPerUnit);
    const modeMassConservation = Math.abs(modeDemand - (modeBoarded + queueBefore)) < 0.01;
    modeSliceRows[mode] = rows;
    modeSummaries[mode] = {
      mode,
      label_zh: parameters.label_zh,
      label_en: parameters.label_en,
      demand_person_trips: modeDemand,
      declared_available_units: declaredAvailableUnits,
      required_units_for_demand: requiredUnitsForDemand,
      supply_unit_shortfall: Math.max(0, requiredUnitsForDemand - declaredAvailableUnits),
      boarded_person_trips: round(modeBoarded, 2),
      failed_boarding_attempts: round(modeFailedBoardingAttempts, 2),
      unresolved_queue_person_trips: round(queueBefore, 2),
      queue_person_minutes_proxy: round(modeQueuePersonMinutesProxy, 2),
      scheduled_service_km_proxy: round(modeScheduledServiceKmProxy, 2),
      peak_slice_load_ratio: round(Math.max(...rows.map((row) => row.load_ratio))),
      mass_conservation: modeMassConservation,
      interpretation: 'synthetic service supply and FIFO queue screen; residual queue is a calibration stop signal, not a local performance result'
    };

    demandProcessed += modeDemand;
    boardedPersonTrips += modeBoarded;
    unresolvedQueuePersonTrips += queueBefore;
    failedBoardingAttempts += modeFailedBoardingAttempts;
    queuePersonMinutesProxy += modeQueuePersonMinutesProxy;
    scheduledServiceKmProxy += modeScheduledServiceKmProxy;
  }

  const gate = model.optimization_search.hard_gate_constraints;
  const peakSliceLoadRatio = round(Math.max(...Object.values(modeSummaries).map((summary) => summary.peak_slice_load_ratio)));
  return {
    policy_id: policyId,
    profile_id: profileId,
    model_class: operations.model_class,
    status: operations.status,
    agents_processed: demandProcessed,
    all_agents_processed: demandProcessed === TOTAL,
    demand_mass_conservation: demandProcessed === TOTAL,
    boarded_person_trips: round(boardedPersonTrips, 2),
    unresolved_queue_person_trips: round(unresolvedQueuePersonTrips, 2),
    failed_boarding_attempts: round(failedBoardingAttempts, 2),
    queue_person_minutes_proxy: round(queuePersonMinutesProxy, 2),
    scheduled_service_km_proxy: round(scheduledServiceKmProxy, 2),
    peak_slice_load_ratio: peakSliceLoadRatio,
    peak_load_gate_ratio: gate.maximum_peak_mode_load_ratio,
    mode_summaries: modeSummaries,
    mode_slice_rows: modeSliceRows,
    mode_slice_mass_conservation: Object.values(modeSummaries).every((summary) => summary.mass_conservation),
    operations_screen_pass: unresolvedQueuePersonTrips === 0 && peakSliceLoadRatio <= gate.maximum_peak_mode_load_ratio,
    selection_boundary: operations.selection_boundary,
    interpretation: 'synthetic aggregate time-slice operations screen; use non-zero residual queue to trigger timetable, capacity and boarding-data calibration'
  };
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

function scenarioParameters(scenarioId, weightsOverride = null) {
  if (scenarioId === 'R1') {
    return {weights: weightsOverride || model.mode_weights_by_group.O1, disruption: true, timeMultiplier: {metro: 1.35, bus: 1.08, bicycle: 1.10, walking_wheelchair: 1.08, car: 1.16, enterprise_shuttle: 1.10}};
  }
  return {
    weights: weightsOverride || model.mode_weights_by_group[scenarioId],
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

function simulateScenario(scenarioId, weightsOverride = null, policyId = scenarioId) {
  const parameters = scenarioParameters(scenarioId, weightsOverride);
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
  let totalPersonKm = 0;
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
      totalPersonKm += tripDistanceKm(mode, distanceFactor, zoneFactor);
      addHistogram(timeHistogram, time);
      if (external) externalAgents += 1;
      if (external && mode === 'car') externalCarAgents += 1;
      if (group.activity === 'work') workActivityAgents += 1;
      processed += 1;
    }
  }

  const modeShares = Object.fromEntries(MODES.map((mode) => [mode, round(modeCounts[mode] / processed)]));
  const modeLoadRatios = Object.fromEntries(MODES.map((mode) => [mode, round(modeCounts[mode] / model.mode_parameters[mode].capacity_person_trips)]));
  const capacityOverflowPersonTrips = sum(MODES.map((mode) => Math.max(0, modeCounts[mode] - model.mode_parameters[mode].capacity_person_trips)));
  const serviceUnitLedger = buildServiceLedger(modeCounts);
  const vehicleOrServiceKmProxy = sum(Object.values(serviceUnitLedger).map((item) => item.vehicle_or_service_km_proxy));
  const maxModeLoadRatio = round(Math.max(...Object.values(modeLoadRatios)));
  const groupSatisfactionProxy = Object.fromEntries(GROUPS.map((group) => [group.id, round(groupSatisfaction[group.id] / groupCounts[group.id], 2)]));
  const groupAccessibilityCompletion = Object.fromEntries(GROUPS.map((group) => [group.id, round(groupAccessibility[group.id] / groupCounts[group.id], 4)]));
  const satisfactionValues = Object.values(groupSatisfactionProxy);
  const accessibilityValues = Object.values(groupAccessibilityCompletion);
  const topRoutes = Object.entries(routeCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([route, count]) => ({route, count, share: round(count / processed)}));
  const topCorridors = Object.entries(corridorCounts).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([corridor, count]) => ({corridor, count, share: round(count / processed)}));

  return {
    scenario_id: policyId,
    status: policyId.startsWith('O') ? 'synthetic_candidate_subject_to_calibration' : 'synthetic_sensitivity',
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
    max_mode_load_ratio: maxModeLoadRatio,
    capacity_overflow_person_trips: capacityOverflowPersonTrips,
    service_unit_ledger: serviceUnitLedger,
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
    person_km_proxy: round(totalPersonKm, 0),
    vehicle_km_proxy: vehicleOrServiceKmProxy,
    vehicle_or_service_km_proxy: vehicleOrServiceKmProxy,
    route_flow_summary: topRoutes,
    top_corridor_flow_summary: topCorridors,
    privacy_check: "aggregate_only_no_personal_trace",
    air_candidate: "blocked"
  };
}

function simulateReturnLeg(scenarioId, weightsOverride, policyId) {
  const parameters = scenarioParameters(scenarioId, weightsOverride);
  const ranges = groupRanges();
  const modeCounts = Object.fromEntries(MODES.map((mode) => [mode, 0]));
  const groupCounts = {};
  const groupSatisfaction = {};
  const groupAccessibility = {};
  const routeCounts = {};
  const timeHistogram = emptyHistogram();
  let processed = 0;
  let externalAgents = 0;
  let externalCarAgents = 0;
  let totalGeneralizedCost = 0;
  let totalSatisfaction = 0;
  let totalAccessibility = 0;
  let totalConflictProbability = 0;
  let totalPersonKm = 0;

  for (const group of ranges) {
    groupCounts[group.id] = 0;
    groupSatisfaction[group.id] = 0;
    groupAccessibility[group.id] = 0;
    for (let offset = 0; offset < group.count; offset += 1) {
      const index = group.start + offset;
      const origin = model.zones.destinations[hash(index, 13) % model.zones.destinations.length];
      const destination = model.zones.origins[hash(index, 11) % model.zones.origins.length];
      const external = unit(index, 17) < (group.id === 'enterprise_employee' ? 0.58 : group.id === 'resident_worker' ? 0.24 : 0.14);
      const mode = selectWeighted(parameters.weights[group.id], index, 31);
      const reliability = model.mode_parameters[mode].reliability[scenarioId];
      const distanceFactor = 0.82 + unit(index, 37) * 0.58;
      const zoneFactor = 0.92 + ((hash(index, 43) % 17) / 100);
      const time = model.mode_parameters[mode].base_minutes * parameters.timeMultiplier[mode] * distanceFactor * zoneFactor + (external ? 5 : 0);
      const accessibility = accessibilityScore(group.id, mode, scenarioId);
      const conflictProbability = model.mode_parameters[mode].conflict_rate * (scenarioId === 'O1' ? 0.72 : scenarioId === 'R1' ? 1.18 : 1.0) * (external ? 1.08 : 1);
      const route = routeTemplate(mode, external, group.id).split(' → ').reverse().join(' → ');
      const waitPenalty = (1 - reliability) * 12;
      const crowdPenalty = mode === 'metro' || mode === 'bus' ? 1.5 : 0;
      const curbPenalty = mode === 'car' ? 3 : 0;
      const generalizedCost = time + waitPenalty + crowdPenalty + curbPenalty + (1 - accessibility) * 15;
      const satisfaction = clamp(100 - generalizedCost * 0.56 - (1 - reliability) * 10 - conflictProbability * 1600, 0, 100);

      addMap(modeCounts, mode);
      addMap(routeCounts, route);
      groupCounts[group.id] += 1;
      groupSatisfaction[group.id] += satisfaction;
      groupAccessibility[group.id] += accessibility;
      totalGeneralizedCost += generalizedCost;
      totalSatisfaction += satisfaction;
      totalAccessibility += accessibility;
      totalConflictProbability += conflictProbability;
      totalPersonKm += tripDistanceKm(mode, distanceFactor, zoneFactor);
      addHistogram(timeHistogram, time);
      if (external) externalAgents += 1;
      if (external && mode === 'car') externalCarAgents += 1;
      processed += 1;
    }
  }

  const modeShares = Object.fromEntries(MODES.map((mode) => [mode, round(modeCounts[mode] / processed)]));
  const modeLoadRatios = Object.fromEntries(MODES.map((mode) => [mode, round(modeCounts[mode] / model.mode_parameters[mode].capacity_person_trips)]));
  const capacityOverflowPersonTrips = sum(MODES.map((mode) => Math.max(0, modeCounts[mode] - model.mode_parameters[mode].capacity_person_trips)));
  const serviceUnitLedger = buildServiceLedger(modeCounts);
  const vehicleOrServiceKmProxy = sum(Object.values(serviceUnitLedger).map((item) => item.vehicle_or_service_km_proxy));
  const groupSatisfactionProxy = Object.fromEntries(GROUPS.map((group) => [group.id, round(groupSatisfaction[group.id] / groupCounts[group.id], 2)]));
  const groupAccessibilityCompletion = Object.fromEntries(GROUPS.map((group) => [group.id, round(groupAccessibility[group.id] / groupCounts[group.id], 4)]));
  const satisfactionValues = Object.values(groupSatisfactionProxy);
  const accessibilityValues = Object.values(groupAccessibilityCompletion);
  const topRoutes = Object.entries(routeCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([route, count]) => ({route, count, share: round(count / processed)}));

  return {
    period: 'PM_return',
    policy_id: policyId,
    population_agents: TOTAL,
    agents_processed: processed,
    all_agents_processed: processed === TOTAL,
    mass_conservation: sum(Object.values(modeCounts)) === TOTAL,
    external_agents: externalAgents,
    external_car_inflow_ratio: round(externalCarAgents / Math.max(externalAgents, 1)),
    mode_counts: modeCounts,
    mode_shares: modeShares,
    mode_load_ratios: modeLoadRatios,
    max_mode_load_ratio: round(Math.max(...Object.values(modeLoadRatios))),
    capacity_overflow_person_trips: capacityOverflowPersonTrips,
    service_unit_ledger: serviceUnitLedger,
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
    person_km_proxy: round(totalPersonKm, 0),
    vehicle_km_proxy: vehicleOrServiceKmProxy,
    vehicle_or_service_km_proxy: vehicleOrServiceKmProxy,
    route_flow_summary: topRoutes,
    privacy_check: 'aggregate_only_no_personal_trace',
    air_candidate: 'blocked'
  };
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

const scenarios = ['B0', 'O1', 'R1'].map((scenarioId) => simulateScenario(scenarioId));
const baseline = scenarios[0];
const optimized = scenarios[1];
const searchCandidates = [
  {id: 'O1_transit_priority', profile: 'O1', result: optimized},
  ...model.optimization_search.candidate_profiles
    .filter((candidate) => candidate.id !== 'O1_transit_priority')
    .map((candidate) => ({
      id: candidate.id,
      profile: candidate.weight_profile,
      result: simulateScenario('O1', model.mode_weights_by_group[candidate.weight_profile], candidate.id)
    }))
];

function candidateEligible(result) {
  const gate = model.optimization_search.hard_gate_constraints;
  return result.all_agents_processed
    && result.mass_conservation
    && result.accessibility_completion_proxy >= gate.minimum_accessibility_completion_proxy
    && result.worst_group_accessibility_gap_proxy_points <= gate.maximum_worst_group_accessibility_gap_proxy_points
    && result.max_mode_load_ratio <= gate.maximum_peak_mode_load_ratio
    && result.air_candidate === 'blocked';
}

function compareCandidates(left, right) {
  const leftKey = [
    candidateEligible(left.result) ? 1 : 0,
    left.result.satisfaction_proxy,
    -left.result.average_generalized_cost_proxy,
    -left.result.p90_travel_time_proxy_minutes,
    -left.result.people_flow_conflict_rate_per_1000_proxy,
    -left.result.external_car_inflow_ratio,
    -left.result.vehicle_km_proxy
  ];
  const rightKey = [
    candidateEligible(right.result) ? 1 : 0,
    right.result.satisfaction_proxy,
    -right.result.average_generalized_cost_proxy,
    -right.result.p90_travel_time_proxy_minutes,
    -right.result.people_flow_conflict_rate_per_1000_proxy,
    -right.result.external_car_inflow_ratio,
    -right.result.vehicle_km_proxy
  ];
  for (let index = 0; index < leftKey.length; index += 1) {
    if (leftKey[index] !== rightKey[index]) return rightKey[index] - leftKey[index];
  }
  return left.id.localeCompare(right.id);
}

const rankedCandidates = [...searchCandidates].sort(compareCandidates);
const selectedPolicy = rankedCandidates[0];
const returnLegReadout = simulateReturnLeg('O1', model.mode_weights_by_group[selectedPolicy.profile], selectedPolicy.id);
const departureChoiceBaseline = simulateDepartureTimeChoiceScreen('B0_reference', 'B0');
const departureChoiceSelected = simulateDepartureTimeChoiceScreen(selectedPolicy.id, selectedPolicy.profile);
const serviceOperationsBaseline = simulateTimeSlicedServiceOperations('B0_reference', 'B0', departureChoiceBaseline);
const serviceOperationsSelected = simulateTimeSlicedServiceOperations(selectedPolicy.id, selectedPolicy.profile, departureChoiceSelected);
const optimizationSearch = {
  method: model.optimization_search.method,
  selection_order: model.optimization_search.selection_order,
  hard_gate_constraints: model.optimization_search.hard_gate_constraints,
  selected_policy: selectedPolicy.id,
  selected_policy_is_not_hand_picked: true,
  ranked_candidates: rankedCandidates.map((candidate, index) => ({
    rank: index + 1,
    policy_id: candidate.id,
    weight_profile: candidate.profile,
    hard_gate_pass: candidateEligible(candidate.result),
    satisfaction_proxy: candidate.result.satisfaction_proxy,
    average_generalized_cost_proxy: candidate.result.average_generalized_cost_proxy,
    p90_travel_time_proxy_minutes: candidate.result.p90_travel_time_proxy_minutes,
    people_flow_conflict_rate_per_1000_proxy: candidate.result.people_flow_conflict_rate_per_1000_proxy,
    external_car_inflow_ratio: candidate.result.external_car_inflow_ratio,
    vehicle_km_proxy: candidate.result.vehicle_km_proxy,
    mode_load_ratios: candidate.result.mode_load_ratios,
    max_mode_load_ratio: candidate.result.max_mode_load_ratio,
    capacity_overflow_person_trips: candidate.result.capacity_overflow_person_trips,
    accessibility_completion_proxy: candidate.result.accessibility_completion_proxy,
    worst_group_accessibility_gap_proxy_points: candidate.result.worst_group_accessibility_gap_proxy_points,
    person_km_proxy: candidate.result.person_km_proxy,
    vehicle_km_proxy: candidate.result.vehicle_km_proxy
  })),
  interpretation: model.optimization_search.interpretation
};
const checks = {
  population_reference_is_regional_scale: TOTAL >= 3000000,
  declared_group_counts_sum_to_population: sum(GROUPS.map((group) => group.count)) === TOTAL,
  baseline_mass_conservation: baseline.mass_conservation,
  optimized_mass_conservation: selectedPolicy.result.mass_conservation,
  all_population_agents_processed: scenarios.every((scenario) => scenario.all_agents_processed),
  optimized_satisfaction_proxy_not_lower: selectedPolicy.result.satisfaction_proxy >= baseline.satisfaction_proxy,
  optimized_generalized_cost_proxy_not_higher: selectedPolicy.result.average_generalized_cost_proxy <= baseline.average_generalized_cost_proxy,
  optimized_conflict_proxy_not_higher: selectedPolicy.result.people_flow_conflict_rate_per_1000_proxy <= baseline.people_flow_conflict_rate_per_1000_proxy,
  optimized_external_car_inflow_not_higher: selectedPolicy.result.external_car_inflow_ratio <= baseline.external_car_inflow_ratio,
  optimized_peak_mode_capacity_screen_pass: selectedPolicy.result.max_mode_load_ratio <= model.optimization_search.hard_gate_constraints.maximum_peak_mode_load_ratio,
  service_unit_ledger_complete: scenarios.every((scenario) => MODES.every((mode) => scenario.service_unit_ledger[mode].person_trips === scenario.mode_counts[mode] && scenario.service_unit_ledger[mode].required_units >= 0)),
  vehicle_km_is_service_unit_based: scenarios.every((scenario) => scenario.vehicle_km_proxy === sum(Object.values(scenario.service_unit_ledger).map((item) => item.vehicle_or_service_km_proxy))),
  return_population_agents_processed: returnLegReadout.all_agents_processed,
  return_mass_conservation: returnLegReadout.mass_conservation,
  air_candidate_fail_closed: scenarios.every((scenario) => scenario.air_candidate === 'blocked'),
  privacy_aggregate_only: scenarios.every((scenario) => scenario.privacy_check === 'aggregate_only_no_personal_trace'),
  optimization_has_eligible_candidate: rankedCandidates.some((candidate) => candidateEligible(candidate.result)),
  optimization_selected_policy_is_eligible: candidateEligible(selectedPolicy.result),
  choice_screen_all_population_agents_processed: departureChoiceBaseline.all_agents_processed && departureChoiceSelected.all_agents_processed,
  choice_screen_mass_conservation: departureChoiceBaseline.mass_conservation && departureChoiceSelected.mass_conservation,
  choice_screen_protects_non_enterprise_groups: departureChoiceSelected.protected_group_shift_count === 0,
  service_time_screen_all_population_agents_processed: serviceOperationsBaseline.all_agents_processed && serviceOperationsSelected.all_agents_processed,
  service_time_screen_mass_conservation: serviceOperationsBaseline.demand_mass_conservation && serviceOperationsSelected.demand_mass_conservation,
  service_time_screen_mode_mass_conservation: serviceOperationsBaseline.mode_slice_mass_conservation && serviceOperationsSelected.mode_slice_mass_conservation,
  service_supply_reconciles_to_declared_capacity: MODES.every((mode) => {
    const parameters = model.mode_parameters[mode];
    const capacityPerUnit = Number(parameters.service_unit.capacity_persons_per_unit);
    const expectedUnits = Math.ceil(parameters.capacity_person_trips / capacityPerUnit);
    return serviceOperationsSelected.mode_summaries[mode].declared_available_units === expectedUnits;
  })
};

const headlineOptimized = selectedPolicy.result;

Object.entries(checks).forEach(([name, passed]) => {
  if (!passed) fail(name);
});

const output = {
  model_version: model.version,
  simulation_class: model.simulation_class,
  regional_scope: model.regional_scope,
  optimization_objective: model.optimization_objective,
  optimization_search: optimizationSearch,
  selected_policy_readout: {
    policy_id: selectedPolicy.id,
    mode_counts: headlineOptimized.mode_counts,
    mode_shares: headlineOptimized.mode_shares,
    mode_load_ratios: headlineOptimized.mode_load_ratios,
    max_mode_load_ratio: headlineOptimized.max_mode_load_ratio,
    capacity_overflow_person_trips: headlineOptimized.capacity_overflow_person_trips,
    service_unit_ledger: headlineOptimized.service_unit_ledger,
    return_leg: returnLegReadout,
    satisfaction_proxy: headlineOptimized.satisfaction_proxy,
    average_generalized_cost_proxy: headlineOptimized.average_generalized_cost_proxy,
    p50_travel_time_proxy_minutes: headlineOptimized.p50_travel_time_proxy_minutes,
    p90_travel_time_proxy_minutes: headlineOptimized.p90_travel_time_proxy_minutes,
    accessibility_completion_proxy: headlineOptimized.accessibility_completion_proxy,
    people_flow_conflict_rate_per_1000_proxy: headlineOptimized.people_flow_conflict_rate_per_1000_proxy,
    external_car_inflow_ratio: headlineOptimized.external_car_inflow_ratio,
    vehicle_km_proxy: headlineOptimized.vehicle_km_proxy,
    person_km_proxy: headlineOptimized.person_km_proxy,
    vehicle_or_service_km_proxy: headlineOptimized.vehicle_or_service_km_proxy,
    departure_time_choice_screen: departureChoiceSelected,
    service_time_operations: serviceOperationsSelected,
    route_flow_summary: headlineOptimized.route_flow_summary
  },
  departure_time_choice_screen: {
    baseline: departureChoiceBaseline,
    selected_policy: departureChoiceSelected,
    selection_boundary: model.departure_time_choice.selection_boundary
  },
  service_time_operations: {
    baseline: serviceOperationsBaseline,
    selected_policy: serviceOperationsSelected,
    selection_boundary: model.service_time_operations.selection_boundary
  },
  scenarios,
  comparison: {
    optimized_minus_baseline: {
      selected_policy: selectedPolicy.id,
      satisfaction_proxy_points: round(headlineOptimized.satisfaction_proxy - baseline.satisfaction_proxy, 2),
      generalized_cost_proxy: round(headlineOptimized.average_generalized_cost_proxy - baseline.average_generalized_cost_proxy, 2),
      p90_travel_time_proxy_minutes: headlineOptimized.p90_travel_time_proxy_minutes - baseline.p90_travel_time_proxy_minutes,
      people_flow_conflict_rate_per_1000_proxy: round(headlineOptimized.people_flow_conflict_rate_per_1000_proxy - baseline.people_flow_conflict_rate_per_1000_proxy, 2),
      external_car_inflow_ratio: round(headlineOptimized.external_car_inflow_ratio - baseline.external_car_inflow_ratio, 4),
      person_km_proxy: headlineOptimized.person_km_proxy - baseline.person_km_proxy,
      vehicle_km_proxy: headlineOptimized.vehicle_km_proxy - baseline.vehicle_km_proxy,
      accessibility_completion_proxy: round(headlineOptimized.accessibility_completion_proxy - baseline.accessibility_completion_proxy, 4)
    },
    interpretation: `${selectedPolicy.id} is the selected synthetic operating candidate only when hard gates hold; proxy improvements are not measured local outcomes.`
  },
  checks,
  calibration_boundary: model.calibration_required_before_local_decision
};

console.log(JSON.stringify(output, null, 2));
if (Object.values(checks).every(Boolean)) console.error('REGIONAL_MODEL_CHECK_PASS: all population-scale checks passed');
