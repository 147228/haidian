#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = __dirname;
const file = path.join(root, 'mobility-responsibility-transfer.json');
const contract = JSON.parse(fs.readFileSync(file, 'utf8'));
const checks = [];
function check(id, ok, detail) {
  checks.push({ id, ok: Boolean(ok), detail });
}

function coverageValidation(value) {
  const groups = value.coverage_groups;
  if (!Array.isArray(groups) || groups.length !== 8) {
    return { ok: false, detail: `${groups?.length || 0}/8 groups` };
  }
  if (groups.some((group) => typeof group !== 'string' || group.trim().length === 0)) {
    return { ok: false, detail: 'coverage groups must be non-empty strings' };
  }
  if (new Set(groups).size !== groups.length) {
    return { ok: false, detail: 'coverage groups must be unique' };
  }
  const known = new Set(groups);
  const mapped = new Set();
  for (const unit of value.resource_units || []) {
    if (!Array.isArray(unit.coverage_groups) || unit.coverage_groups.length === 0) {
      return { ok: false, detail: `${unit.id || 'unit'} has no coverage mapping` };
    }
    if (unit.coverage_groups.some((group) => typeof group !== 'string' || !known.has(group))) {
      return { ok: false, detail: `${unit.id || 'unit'} maps an unknown or empty group` };
    }
    if (new Set(unit.coverage_groups).size !== unit.coverage_groups.length) {
      return { ok: false, detail: `${unit.id || 'unit'} repeats a coverage group` };
    }
    unit.coverage_groups.forEach((group) => mapped.add(group));
  }
  if (mapped.size !== known.size || [...known].some((group) => !mapped.has(group))) {
    return { ok: false, detail: 'unit mappings do not cover the complete group set' };
  }
  return { ok: true, detail: `${mapped.size}/${known.size} groups mapped` };
}

const units = contract.resource_units || [];
check('seven_resource_units', units.length === 7, `${units.length}/7`);
check('unique_unit_ids', new Set(units.map((item) => item.id)).size === units.length, 'unique IDs');
check(
  'resource_denominators',
  units.every((item) => Array.isArray(item.denominator) && item.denominator.length >= 3),
  'each unit has at least three denominators'
);
check(
  'evidence_and_refusal',
  units.every((item) => item.evidence_required?.length >= 2 && item.refusal_condition && item.writeback),
  'evidence, refusal and writeback are present'
);
check(
  'non_ai_equivalence',
  units.every((item) => typeof item.non_ai_equivalent === 'string' && item.non_ai_equivalent.length > 10),
  'all interfaces have a non-AI equivalent'
);
check(
  'coverage_groups',
  coverageValidation(contract).ok,
  coverageValidation(contract).detail
);
const duplicateFixture = JSON.parse(JSON.stringify(contract));
duplicateFixture.coverage_groups[1] = duplicateFixture.coverage_groups[0];
const emptyFixture = JSON.parse(JSON.stringify(contract));
emptyFixture.coverage_groups[0] = '';
const unknownFixture = JSON.parse(JSON.stringify(contract));
unknownFixture.resource_units[0].coverage_groups.push('unregistered_group');
check(
  'negative_regressions',
  [duplicateFixture, emptyFixture, unknownFixture].every((fixture) => !coverageValidation(fixture).ok),
  'duplicate, empty and unknown-group regressions are rejected'
);
check(
  'writeback_schema',
  Array.isArray(contract.writeback_fields) && contract.writeback_fields.includes('next_decision') && contract.writeback_fields.includes('fallback_route'),
  'event, responsibility, fallback and decision fields'
);
check(
  'fail_closed_boundary',
  contract.status === 'conceptual_contract_not_authorized' && contract.review_surface?.field_status === 'HOLD' && contract.offline_evidence?.real_authorization === 0,
  'field HOLD and authorization 0'
);

const failed = checks.filter((item) => !item.ok);
const result = {
  ok: failed.length === 0,
  runner_class: 'supplemental_contract_check',
  formal_gate: false,
  checks,
  summary: {
    resource_units: units.length,
    coverage_groups: contract.coverage_groups?.length || 0,
    real_transfers_accepted: contract.review_surface?.real_transfers_accepted,
    real_authorization: contract.offline_evidence?.real_authorization,
    field_status: contract.review_surface?.field_status,
  },
  boundary: contract.boundary,
};
if (process.argv.includes('--json')) {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} else {
  process.stdout.write(`${result.ok ? 'PASS' : 'FAIL'} mobility responsibility transfer ${checks.length - failed.length}/${checks.length}\n`);
  for (const item of checks) process.stdout.write(`${item.ok ? 'PASS' : 'FAIL'} ${item.id}: ${item.detail}\n`);
}
process.exitCode = result.ok ? 0 : 1;
