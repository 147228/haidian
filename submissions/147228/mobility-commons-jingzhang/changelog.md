# 方案迭代记录

## v1.0 - 2026-08-09

- Created an independent enterprise–resident mobility submission package.
- Replaced autonomy-first narrative with demand ledger, curb states, rail/bus feeder logic and four service levels.
- Added Beijing transport and Haidian parking-service evidence, employer TDM and curb-management research.
- Regenerated bilingual figures, offline visual pages and A3/A0 boards.

## v1.2 - 2026-08-09

- Added an explicit multi-agent queue/network sandbox for residents, enterprise employees, carers/children, visitors, logistics, night workers, metro trains, buses, bicycles, cars, walking/wheelchair flows and the gated air candidate.
- Added synthetic, clearly non-local readouts for queues, station load, transfer wait and curb service, with a calibration list for dated OD, headways, capacity, signals, conflicts and accessibility.
- Refreshed the simulation and evidence boards and added bilingual model-object diagrams with readable units, thresholds, status gates and source notes.

## v1.3 - 2026-08-09

- Added inspectable trip-leg templates for external enterprise commuting, resident services, shuttle transfers, logistics windows and ground-first air fallback.
- Added a dependency-free deterministic runner at `visual/assets/run-mobility-simulation.js`; it recalculates grouped mode shares, service supply, one-minute queues and calibration fields without network access.
- Added activity/agent-based multimodal and grouped accessibility method references; formal calibration now calls for mode share, road/curb volume, door-to-door time, distance and distributional access checks rather than a single efficiency score.

## v1.4 - 2026-08-09

- Added machine-readable `model_family` and `model_detail` disclosure fields while retaining the legacy `model` field for compatibility.

## v1.5 - 2026-08-09

- Added B1, a deterministic enterprise-only flexible arrival-window sensitivity test: 20% of the declared enterprise demand is shifted later across a wider window while resident, care, visitor, logistics and night-worker demand is protected.
- Kept B1 separate from the headline scenario score: it is a method-informed design sensitivity, not a local mode-choice effect, and it requires grouped OD/mode-share calibration before operational use.

## v1.6 - 2026-08-09

- Added bilingual `activity-adaptation.svg` evidence boards so the B1 enterprise flex-window readout is visible in the proposal, not only in the JSON runner output.

## v1.7 - 2026-08-09

- Added explicit B1 guardrails and calibration fields for employee schedule acceptance, rescheduling cost, transit timetable compatibility and grouped mode-share change; queue reduction alone is not treated as an operational optimum.

## v1.8 - 2026-08-09

- Added a machine-readable behavioural choice contract for grouped mode/departure-time choice, cross-boundary OD, generalized-cost components and hard-gate ordering; it imports no paper coefficients.
- Added bilingual `multimodal-choice-board.svg` evidence boards for enterprise, resident, care, logistics and night-worker journeys, with the air candidate visibly blocked until review gates pass.
- Added current departure-time/crowding and transit-oriented UAM method references; the B1 board now identifies the JSON model version consistently.

## v1.9 - 2026-08-09

- Added B3 ground-resilience and equity sensitivity for nominal operation, a 30-minute metro disruption and severe-weather bicycle suppression with declared bus fallback.
- Added deterministic fallback coverage, queue person-minutes, slowest-group gap/recovery proxies and fail-closed policy thresholds; no synthetic value is presented as local p90 or resilience performance.
- Added bilingual `resilience-equity-board.svg` evidence boards and method references on multimodal resilience and agent-based transport equity.

## v2.0 - 2026-08-09

- Added bilingual `system-efficiency-board.svg` evidence boards that put candidate efficiency, grouped enterprise/resident demand, hard gates and the S1 readouts on one version-consistent v1.3 surface.
- Replaced the proposal and offline visual-page simulation image references with the v1.3 board; the retained v1.2 raster remains an historical source asset rather than the current evidence surface.

## v2.1 - 2026-08-09

- Added `regional-scale-commute.json` and `run-regional-commute-simulation.js`: a deterministic 3.122-million-agent synthetic morning-flow stress test that processes every declared population-scale agent and publishes only group, zone, mode and route-template aggregates.
- Added B0/O1/R1 comparison outputs for mode reassignment, p50/p90 travel-time proxies, generalized cost, accessibility completion, people-flow conflict, external-car inflow and a clearly labelled synthetic satisfaction proxy.
- Added bilingual `regional-scale-commute-board.svg` evidence boards and an official population-reference citation; actual workforce shares, OD, capacity, performance and satisfaction remain calibration requirements.

## v2.2 - 2026-08-09

- Added a full-population lexicographic policy search over O1 transit-priority, O2 equity-balanced and O3 active-first profiles; every candidate is replayed over all 3,122,000 synthetic agents before selection.
- Selected O3 under the declared hard gates and proxy objective, and synchronized the bilingual evidence boards and proposal readouts to the selected policy rather than a hand-picked scenario.
