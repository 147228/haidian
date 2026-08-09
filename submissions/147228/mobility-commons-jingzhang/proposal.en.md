---
proposal_format_version: "2"
bilingual_contract_version: "1"
translation_of: "proposal.md"
title: "Jing-Zhang Mobility Commons: An Enterprise–Resident Mobility Operating System"
author_github: "147228"
language: "en"
license: "COMMUNITY-DISPLAY-ONLY"
summary: "A time-windowed curb ledger brings metro, bus, bicycle, walking/accessibility, cars, parking and loading into one auditable system, while external commuting, people flow and multimodal simulation remain explicit; future air mobility is only a conditional, reversible, ground-first experiment."
tracks: ["ai-traffic-walkability", "enterprise-services-ecosystem", "civic-agent-governance"]
scenarios: ["ai-traffic-walkability", "enterprise-service-copilot", "public-safety-operations-review"]
iteration: "v1.0"
---

# Jing-Zhang Mobility Commons: An Enterprise–Resident Mobility Operating System

> **Core proposition:** the next move for the Jing-Zhang corridor is not another speculative road. It is a public mobility operating system that lets enterprises manage arrival, shuttle, freight and charging demand while residents retain continuous walking, accessible and human-service routes.

This is a new independent submission package. It does not modify the existing first-place project. The proposal uses one time-windowed curb ledger, two aggregated demand registers, three connection types, four service levels and five verification gates. Enterprise data is submitted as grouped time windows, not personal traces. Resident needs cover school, care, health, daily shopping, night return and accessibility. Metro and bus remain the structural backbone; bicycle and walking/accessibility provide the first/last mile; cars are managed for necessary trips, parking, loading, charging and emergency access; shared shuttles and AI recommendations are reversible feeder services. External commuting is kept in the OD boundary, and future air mobility is only a conditional experiment. All geometry remains provisional until official boundaries, right-of-way, traffic counts, ownership and field audits are available.

## Design Basis and Source List

The open-call requirements cover three spatial scales, three key areas, AI and mobility scenarios, an innovation ecosystem and reviewable drawings and data layers [source:OFFICIAL-ANNOUNCEMENT] [source:AGENT-TASKBOOK]. The package uses the public provisional site package but replaces the narrative, road attributes, metrics, evidence register and visual boards with an enterprise–resident mobility focus. Both the site and key-area polygons declare `official_boundary=false` and `geometry_role=provisional_constraint` [data:geometry/site_boundary.geojson#SITE-001] [data:geometry/key_areas.geojson#PROV-KEY-001].

Beijing’s 14th Five-Year transport plan frames one-hour door-to-door trips, integrated rail/bus/walking/cycling, public-transport priority and smart transport as policy directions [source:BEIJING-14TH-TRANSPORT-PLAN]. A current Haidian road-parking service tender combines order management, guidance, patrol, equipment inspection, exception handling, backend operations and complaint response. It demonstrates that a curb is an operated asset, not merely a line on a map [source:HAIDIAN-ROAD-PARKING-TENDER-2026]. A Haidian transport planning document requires transit-hub conditions, ground-floor public interfaces, bicycle interchange, emergency routes and traffic-impact review [source:BEIJING-HAIDIAN-TRANSIT-HUB-PDF]. None of these sources is a local baseline for this provisional study area.

Evidence is separated into `known` geometry values, `unknown` local baselines, `design_target` pilot gates and `blocked` conditions. Employer travel-demand-management research supports transit benefits, multimodal subsidies, flexible hours and guaranteed rides home, but its effects are context-dependent and are not copied as Haidian outcomes [source:EMPLOYER-TDM-LONGITUDINAL] [source:EMPLOYER-TDM-GUIDE].

## Three-Level Scope Framework

The regional layer studies the rail, bus, campus, enterprise and residential relationships around the Jing-Zhang corridor. The overall layer translates them into access chains, curb states, public-service interfaces, blue-green fallback and maintenance packages. The key-area layer tests one reversible operational package in each of Zhongzhiyuan, the AI Origin Community and Dazhongsi [depth:three_level_scope_framework] [standard:PROJECT-OFFICIAL-ANNOUNCEMENT].

The three scales share the same provisional `site_boundary`, `key_areas`, `land_use`, `buildings`, `roads`, `green_space`, `public_space`, `constraints` and `phasing` layers. The approximately 11.41 km² area is a design-comparison value only [metric:site_area_sqm]. A future official revision must trigger one coordinated re-render of all geometry, metrics, drawings and visual cards.

## Coordinated Research Area: Industry and Future City Research

### Enterprise side

Enterprise mobility desks submit grouped demand windows: approximate employee bands, entrances, shuttle periods, freight and loading windows, visitor peaks, night work and emergency needs. The system compares public transport, consolidated shuttles, cycling, walking and shared feeder options. It does not retain individual trajectories. Enterprises receive a service window rather than permanent public right-of-way, and they share responsibility for on-site guidance, cleaning, maintenance and complaint closure.

### Resident side

Resident input records service types and time bands for school, care, health, shopping, night return and accessible travel. It does not require a continuous home-to-work trace. Offline, telephone, paper and human-service routes remain equivalent options. Results must be stratified by age, mobility, care load, night travel and enterprise affiliation; a single average satisfaction score cannot establish equity [source:BEIJING-ACCESSIBILITY-REGULATION] [source:SHARED-MOBILITY-OECD].

### Managed future mobility

Autonomous or on-demand shuttles are treated as regulated feeders, not replacements for rail or unlimited vehicle supply. Research finds that shared autonomous vehicles can complement or compete with transit and may increase vehicle kilometres if supply is unmanaged [source:SAV-TRANSIT-COMPETITION] [source:SAV-MICROTRANSIT]. Every feeder therefore needs capacity, a time window, a responsible operator, an accessible human fallback and a stop condition.

## Overall Design Area: Urban Renewal and Regulatory-Plan-Level Urban Design

The overall structure is a shared mobility loop, not a new closed road. Three connection types are used: stable rail/bus interchange, consolidated enterprise/shared feeder services, and human-first accessible walking. Four service levels are measured: route continuity, transfer reliability, orderly curb use and complaint closure. Curb-management research supports treating delivery, ride-hail, shared mobility and public events as competing demands that require joint public/private scheduling and responsibility [source:CURBSPACE-MANAGEMENT-2021].

### Five ground modes and one conditional air experiment

The loop is layered instead of flattening every trip into one line: **metro/rail** carries the long-distance backbone and external commuting; **bus** adds coverage, night service and transfer resilience; **bicycle** handles station-to-campus and station-to-community access; **walking and wheelchair access** are the public base for every mode; and **cars** are managed for necessary trips, parking, loading, charging, drop-off and emergency access. Enterprise shuttles, on-demand minibuses and shared feeders must connect to rail/bus rather than add unmanaged vehicle supply [source:BEIJING-14TH-TRANSPORT-PLAN].

Future air mobility is represented only as an `air-mobility-candidate` relationship node. Without written review of airspace, routes, airworthiness, operator, insurance, weather, fire, noise, emergency response and public participation, the package draws no operating route, promises no vertiport and claims no permit. If an experiment becomes eligible, it starts with ground transfer, accessible evacuation, human supervision, low frequency, reversibility and weather cancellation [source:BEIJING-LOW-AIR-ECONOMY-2024] [source:CAAC-UAV-REGULATION-2024].

### People-flow and multimodal simulation

People are the center of the simulation: enterprise employees, residents, carers, children, wheelchair users, visitors, logistics/maintenance staff, night workers and emergency responders receive separate grouped OD and time windows. No continuous personal trace is required. External commuting crosses the provisional boundary and must be recorded in P0 by origin/destination direction, metro, bus, bicycle, car, walking and shuttle mode, park-and-ride and cross-line transfer. It feeds `external_commute_od_baseline` and `external_commute_generalized_cost_index` as survey products, not guessed facts.

Scenarios include weekday AM/PM peaks, off-peak, event days, rain/heat, metro or bus outage, road/parking failure, and future-air comparisons with ground-only transfer and weather cancellation. Metro/bus inputs include schedules, station capacity, waiting and transfer buffers; bicycle inputs include parking, sharing and conflicts; car inputs include intersection queues, parking, loading, charging and emergency clearance; walking/wheelchair inputs include section width, crossings, gradients, care stops and accessible detours. SUMO is an open base for multimodal simulation, but local signals, station capacities, bicycle behaviour and pedestrian flows must be calibrated with field counts; software output is not a Haidian performance claim [source:SUMO-MULTIMODAL-DOCS] [source:MULTIMODAL-TRAFFIC-REALITY-2025].

Optimization is hard-gate first and Pareto-based afterward. Safety, fire/emergency access, accessibility continuity, public-transport protection, privacy and human service are screened before comparing generalized cost, people-flow conflicts, car vehicle-kilometres, energy, external-commute reliability and worst-group gaps. The result is an explainable candidate set and an unknown `multimodal_system_efficiency_index`, not an uncalibrated claim that one score is “the highest overall efficiency” [metric:person_flow_conflict_rate] [metric:multimodal_system_efficiency_index].

The first intervention is reversible: signs, wayfinding, rain shelters, seats, bicycle parking, accessible ramps, enterprise mobility desks, human service counters and time-window curb markers. The package does not claim a new bridge, road widening, parking supply, building height, floor-area ratio or investment amount. All land-use and building relationships remain conceptual and are tied to the machine layers [data:geometry/land_use.geojson#LU-001] [data:geometry/buildings.geojson#BUILD-001] [depth:land_use_layout] [depth:development_intensity_controls].

## Detailed Design of Key Areas

Zhongzhiyuan tests enterprise arrival, shuttle consolidation and loading. The AI Origin Community tests daily resident access, care and a genuinely equivalent human route. Dazhongsi tests rail transfer, bicycle parking, loading and event-day public-space management. Each area has an accountable enterprise or community operator, a transport reviewer and a maintenance owner; no partner, permit or existing operation is claimed [metric:key_area_count] [depth:three_key_area_detailed_design].

The first pilot is a small morning and evening window in Zhongzhiyuan, an accessible daily-route comparison in the Origin Community, and a rail/curb separation rehearsal at Dazhongsi. Enterprise bookings cannot become permanent community bans. Shared vehicles cannot occupy a fire route, accessible path or emergency corridor.

## AI Innovation Ecosystem, Personas, and AI+ Scenarios

Personas include enterprise mobility coordinators, residents and carers, wheelchair users, rail and bus operators, logistics and maintenance staff, school and community workers, night-shift staff and transport/privacy/fire professionals. AI aggregates demand, explains conflicts and prepares rollback checklists; it cannot permanently lock a public route.

Three industry tests structure the pilot: enterprise demand aggregation using grouped data; an equal-service comparison between AI, human, telephone and paper routes; and curb/communication-loss fallback during peak, event, snow or rain scenarios. Ten scenario cards cover consolidated enterprise shuttles, public-transport benefits, guaranteed night return, loading reservations, accessible daily routes, the last 500 metres to rail, event-day separation, degraded service and complaint-to-maintenance closure [source:EMPLOYER-TDM-GUIDE] [standard:PROJECT-AGENT-OPEN-CALL-TASKBOOK].

## Land Use, Building Scale, and Retain-Renovate-Demolish Strategy

The existing conceptual building footprints occupy about 2.72% of the provisional study area; this is not a statutory building-coverage ratio [metric:building_footprint_area_sqm] [metric:building_footprint_ratio]. Existing public services, transit entrances, fire routes, accessible paths and mature shade are retained. Reversible renewal upgrades entrances, waiting, bicycle parking, ramps, information signs and service counters. Demolition is not proposed without survey, ownership, structure, fire, utility and community evidence [source:HAIDIAN-ROAD-PARKING-TENDER-2026] [depth:retain_renovate_demolish].

## Transport, Rail, Municipal Infrastructure, and Public Services

The conceptual network includes one north–south relationship line of about 9.60 km, three east–west links and a slow-mobility relationship network of about 13.01 km. These are design lengths, not engineered road centrelines or proof of current continuity [metric:design_north_south_spine_length_m] [metric:design_east_west_connector_count] [metric:design_slow_mobility_network_length_m]. Each segment needs a future audit of section, signals, crossings, entrances, gradients, tactile paving, lighting, shade, loading, fire access, drainage, utilities, ownership and maintenance.

The curb ledger uses `open`, `booked`, `service`, `human-only` and `emergency` states. Every state change has a responsible person, start and end time, service purpose, clearing action, alternative route and complaint entry. Enterprise data is grouped; resident data is service-based. The four operational metrics are accessible-route completion, first/last-mile reliability, curb-window compliance and complaint-closure hours [source:CURBSPACE-MANAGEMENT-2021] [source:NIST-HUMAN-CENTERED-AI]. All local demand, occupancy, delay, passenger, charging and complaint values remain unknown until measured.

Metro and bus are the backbone. Enterprise shuttles and on-demand vehicles feed that backbone. Parking and loading are managed as timed services rather than solved only by more supply. Rain, snow, lighting, charging, information signs and maintenance are entered into one municipal asset register. The Haidian transport document and slow-mobility procurement material provide the checklist for hub, interchange, emergency and construction review [source:BEIJING-HAIDIAN-TRANSIT-HUB-PDF] [source:HAIDIAN-SLOW-MOBILITY-TENDER-2022] [depth:traffic_rail_slow_parking] [depth:municipal_new_infrastructure].

If an air-mobility experiment becomes eligible, it remains a controlled add-on to the ground system. Metro/bus transfer, walking/wheelchair paths, fire egress, noise and the quiet residential interface must be protected before airspace and operating permissions are reviewed. `air_ground_transfer_reliability`, throughput, cancellation, weather windows, noise, emergency response and insurance responsibility remain `unknown`. Beijing’s low-altitude action plan is policy context; the CAAC unmanned-aircraft regulation is a safety and operating-responsibility gate; neither is a local flight or construction permission [source:BEIJING-LOW-AIR-ECONOMY-2024] [source:CAAC-UAV-REGULATION-2024] [source:UAM-BEIJING-MULTIMODAL-2024].

### Design-scenario simulation (transparent sandbox, not a baseline)

Before field OD, station capacity, signals, people flow and curb counts exist, `visual/assets/movement-simulation.json` runs an interpretable 1,000-person normalized design unit: S0 unmanaged peak, S1 multimodal curb coordination, S2 air candidate blocked by regulatory gates, and S3 ground fallback in extreme weather. The package also includes the dependency-free deterministic runner `visual/assets/run-mobility-simulation.js`; it recomputes the declared design-unit queues and service supply without upgrading papers or synthetic values into a Haidian baseline. S1 is only a provisional design candidate after the proposed hard-gate screen; generalized cost, transfer reliability, people-flow conflicts, external-car inflow, worst-group gap and energy are illustrative inputs, not current Haidian performance. The board exposes the chain: hard gates first, Pareto comparison second, local calibration last [metric:multimodal_system_efficiency_index] [metric:person_flow_conflict_rate] [standard:SUMO-MULTIMODAL-SIMULATION].

The model objects are explicit rather than being a mode checklist: the 1,000-person design unit contains 380 residents, 450 enterprise employees, 60 carers/children, 50 visitors, 40 logistics or maintenance workers and 20 night-shift workers. Five `trip_leg_templates` make external enterprise commuting, resident daily services, enterprise-shuttle transfers, logistics/loading and ground-first air fallback inspectable. The network models metro trains (180 persons per vehicle, 10-minute headway), buses (60 persons per vehicle, 12-minute headway), bicycle parking, car curb service, a continuous walking/wheelchair stream and an air candidate held behind a gate. At 60-second steps it records location, mode, queue, vehicle occupancy, transfer status, curb state, conflicts and accessibility flags, then reports peak queues, station/vehicle load, transfer wait, car curb queues and worst-group gaps. Reviewers can run `node visual/assets/run-mobility-simulation.js` to recalculate mode shares, service supply, queues and calibration fields offline; the values in `model_analysis.derived_readouts` remain synthetic sensitivity outputs, not field observations [source:SUMO-MULTIMODAL-SIMULATION] [source:ATOM-MULTIMODAL-ABM] [source:ACCESS-ACCESSIBILITY-ABM].

In this normalized sandbox, the unmanaged peak produces a modeled peak curb queue of 86 cars and a station-gate load ratio of 1.05; the multimodal curb candidate produces 0 cars and 0.88; the weather ground fallback produces 47 cars and 0.96. This points to station gates, bus-stop capacity, curb service and accessible crossings as the first calibration targets, not to a construction conclusion. Following open activity/agent-based methods, formal calibration must compare mode share, road/curb volume, door-to-door time, trip distance and grouped accessibility—not only a single efficiency score [source:ATOM-MULTIMODAL-ABM] [source:ACCESS-ACCESSIBILITY-ABM]. Dated cross-boundary OD, headways, sections, parking, conflicts and fire/accessibility review must replace the design inputs before rerunning or claiming performance.

![v1.3 enterprise–resident mobility system efficiency: candidates, groups and gates](assets/figures/system-efficiency-board.en.svg)
![Multimodal model objects: residents, vehicles, metro and analysis outputs](assets/figures/model-objects.en.png)

#### Regional-scale integrated commute simulation: process the full 3.122M morning chains

To address the objective of maximizing system efficiency and the satisfaction outcome, the package now adds `visual/assets/regional-scale-commute.json` and `node visual/assets/run-regional-commute-simulation.js`. It uses the official Beijing profile’s 3.122 million Haidian permanent residents at the end of 2024 as a **population-scale coverage reference**, and processes one synthetic morning chain for every agent: home/boundary → first mile → metro/bus/bicycle/walking-accessible/car/enterprise shuttle → work or service destination. The 3,122,000 figure is a population-scale stress test, not a workforce count, census microdata release or observed local OD. The enterprise, resident-worker, carer/child, visitor/service, logistics/maintenance and night-worker shares are declared scenario weights awaiting calibration [source:HAIDIAN-POPULATION-2024].

The runner actually loops through all 3,122,000 synthetic agents and retains only group, zone, mode, route-template, time-histogram, passenger-kilometre, service-unit-ledger and mass-conservation aggregates; no address, employer, identity or continuous personal trace is stored. B0 is a concentrated-arrival stress case, O1/O2/O3/O4 are public-transport, active-mobility, equity and capacity-balanced candidates, and R1 is a ground fallback screen after a metro disruption. The runner fully replays O1/O2/O3/O4 for the AM leg, applies a hard gate of peak mode load ≤1.35×, then selects lexicographically by maximum satisfaction proxy → generalized cost → p90 time → conflicts → external-car inflow → vehicle/service-km; O3 has the highest paper score but fails its bicycle-load gate, so O4 capacity-balanced wins the declared synthetic set. O4 then runs a separate full-population PM return coverage screen with reversed aggregate routes; this is a coverage check, not an observed evening OD. “Satisfaction” is a declared `satisfaction_proxy` built from time, reliability, accessibility and conflict; it is not a resident survey result.

Under the current synthetic inputs, the full-replay-selected O4 moves the satisfaction proxy from 54.67 to 66.44, generalized-cost proxy from 60.34 to 49.44, p90 time proxy from 90 to 60 minutes, people-flow conflicts from 5.74 to 3.13 per 1,000, external-car inflow from 26.95% to 8.47%, passenger-kilometre proxy from 34.86M to 28.40M, vehicle/service-kilometre proxy from 9.00M to 3.51M, and peak mode load from 1.57× to 1.21×. The `service_unit_ledger` reports, for each mode, required and available train departures, bus departures, bicycle slots, accessible-path slots, car vehicle equivalents and enterprise shuttle vehicles; these are transparent synthetic service screens, not observed fleets, timetables or capacity facts. The ranked O1/O2/O3/O4 candidates, capacity loads and gate results are emitted by the runner, so a hand-picked candidate is not presented as optimal; O3 can return only after bicycle capacity is supplied or calibrated. These values demonstrate population-scale conservation, replayability and comparison; they do not establish the same improvement in Haidian. Before a local decision, the package still requires time-binned OD, workforce composition, station/bus/curb capacity, grouped mode shares, door-to-door p50/p90, accessibility audits, fleet/headway evidence and resident/employee satisfaction surveys.

![Regional-scale integrated commute simulation: 3.122M synthetic population agents](assets/figures/regional-scale-commute-board.en.svg)

#### B1 Enterprise arrival sensitivity: an inspectable flex-window test

Without moving resident, care/child, visitor, logistics/maintenance or night-worker demand, B1 applies a 20% flexible-arrival sensitivity only to the 450 enterprise employee design units, moving 90 units out of the sharpest peak into a wider arrival window. The offline runner produces a synthetic readout of total peak queue 174 → 164 and mean queue person-minutes 75.7999 → 71.7917; peak car-curb queue stays at 60 and unmet demand stays at 89. The metro and bus load changes are pressure changes under the declared inputs, not an enterprise response or current Haidian performance; a real flex-window policy must also measure employee acceptance, rescheduling time cost, transit schedule compatibility and grouped mode-share change rather than optimizing queue reduction alone. Dated grouped enterprise OD, mode share, headways and station counts must replace the inputs before operational use [source:MATRAM-ACTIVITY-ADAPTATION-2026] [metric:mode_transfer_reliability].

![Enterprise arrival sensitivity: B1 flex-window effect](assets/figures/activity-adaptation.en.svg)

#### B2 Mode and departure-time choice: one ledger for external commuting and people flow

B1 asks whether enterprise arrival can be spread; B2 adds why a grouped traveller chooses a mode and time. Each alternative carries door-to-door time, arrival flexibility, waiting and transfer reliability, station crowding, curb/parking friction, fare/energy and the slowest-group gap. Fire, accessibility, public-transport, privacy and human-service gates are screened first. Enterprise employees may adjust an arrival window, while residents, carers, children, logistics and night workers keep their own activity chains and human fallback; cross-boundary commuting enters as grouped OD, never as a personal trajectory [source:JOINT-MODE-TIME-CROWDING-2020] [source:DTUE-PT-2025].

This is a calibratable behavioural contract, not a transfer of paper coefficients into Haidian. Dated mode shares, grouped departure times, headways/capacity, station and crossing counts, curb queues, door-to-door p50/p90 and accessible-route audits must be collected before local parameters are estimated. Flexible work schedules can change commute departure distributions, but flexibility, late-arrival penalties and care constraints must be validated by group rather than replaced by one average [source:FLEXTIME-DEPARTURE-CHOICE-2013] [source:MATRAM-ACTIVITY-ADAPTATION-2026].

This pass makes B2 executable as a separate `departure_time_choice_screen`. It still processes all 3,122,000 synthetic agents, but only enterprise employees may enter a synthetic 20-minute early-flex window; residents, carers/children, visitors, logistics and maintenance, and night workers are not shifted by the model. The B0 preferred window is 95%; the O4 screen becomes 6.99% early, 88.01% preferred and 5% late, with 218,266 synthetic enterprise agents marked as adjustable, a 4.365M person-minute rescheduling-cost proxy, and zero protected-group shifts. This is not employee behaviour, an arrival distribution or timetable performance observation, and it is not used to rank O4. It makes the operating contract explicit—who may adjust, who cannot be sacrificed and how rescheduling cost is recorded—pending employee acceptance, headway and 15-minute capacity evidence [source:JOINT-MODE-TIME-CROWDING-2020] [source:DTUE-PT-2025].

![Cross-boundary commute and people flow: mode-choice contract](assets/figures/multimodal-choice-board.en.svg)

![Departure-time choice and service-unit ledger: population-scale agents, enterprise flexibility and mode load](assets/figures/activity-choice-operations-board.en.svg)

To keep a mode-level capacity screen of ≤1.35× from being misread as an operable timetable, v2.10 expands the same grouped departure demand into three 15-minute service slices. A FIFO residual-capacity rule carries queues from slice to slice and records available metro departures, bus departures, bicycle slots, continuous accessible-path slots, car equivalents and enterprise-shuttle vehicles, plus boarded trips, failed boarding attempts, residual queue and queue person-minute proxies. The independent O4 synthetic operations screen still processes 3,122,000 agents, reaches a 3.2431× peak slice load, leaves 452,668 trips in the end-of-window residual queue and produces a 16.241M queue-person-minute proxy; its operations gate is therefore **not passed**. This is not measured Haidian performance. It is an explicit stop signal: dated services, station/stop/curb capacity, boarding/denied-boarding counts and accessible-service capacity must be supplied before the candidate can be treated as operable. The screen does not rank O1/O2/O3/O4; the papers provide capacity-constrained schedule-based assignment boundaries, not local coefficients [source:SCHEDULED-CAPACITY-TRANSIT-2012] [source:DYNAMIC-PT-CAPACITY-2024].

![Time-slice service operations ledger: boarding, failed boarding attempts and residual queues](assets/figures/service-time-operations-board.en.svg)

#### B3 Disruption, weather and the slowest group: efficiency must recover

B2 asks how grouped travellers choose in normal operation. B3 asks who can still arrive, and how fast the system recovers, when a metro segment is disrupted, severe weather suppresses cycling or the air candidate is closed. The runner replays three events on the S1 ground-first candidate: nominal operation, a 30-minute metro-segment disruption with declared bus fallback, and severe weather with bicycle fallback to bus. It reports affected-mode fallback coverage, queue person-minutes, a slowest-group gap proxy and a recovery-time proxy, while fire, accessibility, human-service and air-operation gates remain prior to optimization [source:UAM-MULTIMODAL-RESILIENCE-2025] [source:TRANSPORT-EQUITY-ABM-2025].

In the normalized design unit, the metro-disruption fallback coverage proxy is 76.92% and the severe-weather bicycle fallback proxy is 72.14%. The slowest group is the wheelchair-user group in both synthetic events, with gap proxies of 12.1998 and 13.3571 points and recovery proxies of 27.2997 and 30.0357 minutes. These are transparent stress-test outputs, not local resilience or p90 commute facts. Dated disruption logs, weather cancellations, accessible-route completion and grouped door-to-door p90 observations must replace them before operational use. If fallback coverage falls below 70%, the slowest-group gap proxy exceeds 24 points or recovery exceeds 45 minutes, the design stops for redesign; air mobility cannot fill an evidence gap [source:MATRAM-ACTIVITY-ADAPTATION-2026] [source:UAM-TOD-VERTIPORT-2026].

![Disruption and weather stress test: ground fallback, slowest group and air gate](assets/figures/resilience-equity-board.en.svg)

## Blue-Green Network, Public Space, and Urban Character

Blue-green space provides shade, rest, rain fallback and a safer night interface. The conceptual green ratio is about 12.34% and public-space ratio about 7.33%; neither proves ecological, thermal or drainage performance [metric:green_ratio] [metric:public_space_ratio]. Public counters, transit entrances, waiting, bicycle parking and green edges should share shelter, seats, lighting, water and accessible information without blocking wheelchair turns or fire access.

The hard boundaries are: do not send people into ponding routes during storms; provide a human alternate route during heat; and reduce unnecessary equipment and lighting during dark or ecologically sensitive periods. Beijing walking/cycling and accessibility sources support continuity and maintenance requirements [standard:BEIJING-WALK-CYCLE-DB11-1761] [standard:BEIJING-ACCESSIBILITY-REGULATION] [source:BEIJING-SLOW-MOBILITY].

## Renewal Projects, Implementation Policy, and Phasing

P0 inventories assets, demand, curbs, accessible routes and complaints. P1 runs small reversible tests for two enterprise windows, one resident daily chain and one rail transfer chain. P2 considers conditional feeder expansion only after traffic, fire, accessibility, privacy, ecology, insurance, procurement, operator and maintenance evidence is signed. The service-tender logic of asset IDs, patrol, equipment checks, exception handling and complaint response is translated into every mobility asset [source:HAIDIAN-ROAD-PARKING-TENDER-2026] [depth:renewal_project_list] [depth:phasing_implementation].

The implementation loop is register → pilot → review → expand or stop. Operators sign a reversible service agreement; residents keep public paths and human service. An AI recommendation may always be rejected by an on-site person.

## Metrics, Area Recalculation, and Compliance Matrix

The package separates file-readable geometry, unknown local baselines and pilot targets. Known values include the provisional area, three key areas, building footprint, green/public ratios and design relationship lengths [metric:site_area_sqm] [metric:key_area_count] [metric:building_footprint_area_sqm] [metric:green_ratio] [metric:public_space_ratio]. Unknown values include enterprise commute demand, external commute OD, resident access, employer multimodal trip rate, parking occupancy, curb compliance, transfer reliability, accessible-route completion, people-flow conflicts, complaint closure, workplace charging gap, multimodal system efficiency, mode-transfer reliability and air-ground transfer reliability.

Pilot targets are not current outcomes: accessible-route completion at least 0.95, transfer reliability at least 0.85, curb-window compliance at least 0.90, a first complaint response within four hours and a status update within 24 hours [metric:accessible_route_completion_ratio] [metric:first_last_mile_transfer_reliability] [metric:curb_time_window_compliance_ratio] [metric:mobility_service_complaint_closure_hours]. Five gates cover authoritative geometry, consented demand, safety, responsibility and equity. The compliance, standards and design-depth matrices bind these claims to the proposal, GeoJSON, drawings and self-check [standard:PROJECT-OFFICIAL-ANNOUNCEMENT] [standard:PROJECT-AGENT-OPEN-CALL-TASKBOOK] [depth:metrics_recalculation] [depth:risk_missing_data].

![Enterprise–resident mobility overview with three key areas and five gates](assets/figures/site-overview.en.png)
![Two-sided demand registers and time-windowed land-use structure](assets/figures/land-use-structure.en.png)
![Key-area mobility roles and curb service levels](assets/figures/key-areas.en.png)
![Metro, bus, bicycle, walking, car, people flow and conditional air experiment](assets/figures/mobility-bluegreen.en.png)
![Multimodal simulation, external commuting, people flow and efficiency evidence dashboard](assets/figures/metrics-evidence.en.png)

## Risk, Copyright, and Compliance

This package does not replace right-of-way confirmation, traffic-impact assessment, parking contracts, fire review, accessibility review, construction drawings, operating permits, data compliance, insurance or procurement. The main risks are enterprise demand displacing resident access, unmanaged on-demand vehicles adding traffic, unmaintained curb states, unowned complaints and digital exclusion. Each has a rollback: human service, public transport, paper/telephone access, removable equipment, paused reservations, public aggregate incident summaries and a next review date [source:SHARED-MOBILITY-OECD] [source:CURBSPACE-MANAGEMENT-2021] [depth:risk_missing_data].

Government and tender sources establish policy and responsibility frameworks; papers establish methods and cautions; OSM and provisional geometry only support background screening and design relationships. No source is used to claim a local capacity, enterprise partnership, station performance, accident rate, satisfaction improvement or health outcome.

## References

The source register records access date, use and non-use boundaries for the official transport plan, Haidian tender and planning evidence, employer TDM research, curb-management research, shared-mobility research, multimodal simulation documentation, air-mobility methods and the public site package [source:SOURCE-REGISTRY] [source:OSM-TRANSPORT-CONTEXT].

Additional method and policy entries are `BEIJING-LOW-AIR-ECONOMY-2024`, `CAAC-UAV-REGULATION-2024`, `SUMO-MULTIMODAL-DOCS`, `MULTIMODAL-TRAFFIC-REALITY-2025`, `UAM-BEIJING-MULTIMODAL-2024` and `UAM-PUBLIC-TRANSIT-2023`; they are not local baselines or permissions.

The choice-contract references are `JOINT-MODE-TIME-CROWDING-2020`, `DTUE-PT-2025`, `FLEXTIME-DEPARTURE-CHOICE-2013` and `UAM-TOD-VERTIPORT-2026`; they define calibration questions and safety boundaries, not imported coefficients, capacity or a local air route.

The population-scale method references are `MATSIM-LARGE-SCALE-ABM`, `MATSIM-BOOK-ACTIVITY-BASED`, `ACTIVITY-BASED-DISAGGREGATE-2001`, `ACCEQ-DRT-2023`, `SCHEDULED-CAPACITY-TRANSIT-2012`, `DYNAMIC-PT-CAPACITY-2024` and `SIMMOBILITY-MULTISCALE-2017`; they motivate activity chains, full-population replay, capacity feedback, time-slice boarding checks and future equity-oriented feeder candidates, but do not supply Haidian coefficients or outcomes.

**Boundary statement:** this is an auditable concept and reversible pilot framework for enterprise–resident mobility. It is not an approved plan, road-opening announcement, parking permit, enterprise agreement, capacity proof, health claim or construction commitment. The existing first-place project remains untouched.
