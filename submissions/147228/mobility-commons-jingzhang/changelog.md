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

## v2.3 - 2026-08-09

- Aligned the runner’s optimized-policy checks with the full-replay-selected policy, so machine checks, comparison output and evidence boards all refer to O3 rather than silently retaining O1.

## v2.4 - 2026-08-09

- Removed the last hard-coded O1 selection phrase from the regional runner; the interpretation now reports the policy actually selected by the full replay.

## v2.5 - 2026-08-09

- Added candidate-level peak mode-load ratios and capacity-overflow person-trips to the population-scale replay output and selected-policy readout, making congestion/capacity evidence inspectable before adding a capacity-balanced policy.

## v2.6 - 2026-08-09

- Added O4 capacity-balanced policy search and a declared 1.35x maximum peak mode-load hard gate; the selected policy must now satisfy capacity, accessibility, privacy, mass-conservation and air-candidate gates before satisfaction ranking.

## v2.7 - 2026-08-09

- Added an independent full-population PM return-leg coverage screen for the selected policy. It replays all 3,122,000 agents with reversed aggregate route chains while keeping morning policy selection unchanged; the return readout is explicitly a synthetic coverage check, not an observed evening OD claim.

## v2.8 - 2026-08-09

- Corrected the regional distance ledger: passenger kilometres are now separate from vehicle/service-unit kilometres; the earlier aggregate was not labelled precisely enough for metro, bus, bicycle and walking modes.
- Added a machine-readable service-unit ledger for metro departures, bus departures, bicycle slots, continuous accessible-path slots, car vehicle equivalents and enterprise shuttle vehicles, including required units, available units, load ratio and synthetic unit-kilometres.
- Added explicit runner checks for service-ledger completeness and service-unit-based vehicle-kilometre calculation, and refreshed the bilingual regional board and proposal readouts to v2.8.
