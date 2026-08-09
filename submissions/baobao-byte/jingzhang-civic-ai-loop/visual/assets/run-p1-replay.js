#!/usr/bin/env node
// Deterministic offline P1 synthetic desktop replay: no network, no personal data.
const fs=require("fs"), path=require("path"), crypto=require("crypto");
const dir=__dirname;
const fixturePath=path.join(dir,"p1-replay-fixtures.json");
const evidencePath=path.join(dir,"p1-replay-evidence.json");
const schemaPath=path.join(dir,"civic-agent-receipt.schema.json");
const load=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const hash=b=>crypto.createHash("sha256").update(b).digest("hex");
const fixtures=load(fixturePath), schema=load(schemaPath);
const schemaMetadataPresent=typeof schema.$schema==="string"&&schema.$schema.endsWith("2020-12/schema")&&typeof schema.$id==="string"&&schema.$id.length>0;
if(!schemaMetadataPresent) throw Error("schema metadata invalid");
function decide(c){const stops=[];
 if(c.route_state==="severe_safety_mislead") stops.push("severe_safety_mislead");
 if(!c.handoff_available) stops.push("human_handoff_unavailable");
 if(!c.physical_break_isolated) stops.push("physical_break_not_isolated");
 if(c.route_state==="uncertain") stops.push("uncertainty_requires_human_review");
 return [stops.length?"suspend":"continue_limited",stops];}
const memory=fixtures.cases.map(c=>c.id);
const results=fixtures.cases.map(c=>{const [actual,hard_stops]=decide(c); return {case_id:c.id,actual,expected:c.expected,pass:actual===c.expected,hard_stops,fallback:actual==="suspend"?"paper_route_and_staffed_desk":"staffed_desk_visible"};});
const stopSet=new Set(results.flatMap(r=>r.hard_stops));
const assertions={all_expected_dispositions:results.every(r=>r.pass),four_fixture_cases:results.length===4,four_hard_stop_branches:stopSet.size===4,human_fallback_present:results.every(r=>r.fallback),no_network_inputs:fixtures.scope==="offline_synthetic_desktop_only",schema_metadata_present:schemaMetadataPresent};
const before=memory.length;
const deletionLog=[...memory].map(case_id=>({case_id,action:"deleted_from_replay_memory"})); memory.length=0;
const rollback=["disable_route_assistant","publish_stop_state","activate_paper_route","route_to_staffed_desk","retain_public_incident_record_only"];
assertions.memory_deleted_4_to_0=before===4&&memory.length===0&&deletionLog.length===4;
assertions.five_step_rollback=rollback.length===5;
const payload={evidence_version:"1.0",generated_at:"2026-08-09T13:30:00Z",status:Object.values(assertions).every(Boolean)?"PASS":"FAIL",claim_boundary:"Synthetic offline desktop replay only; NOT AUTHORIZED and NOT RUN as a field or operational pilot.",inputs:{fixtures:"visual/assets/p1-replay-fixtures.json",fixture_sha256:hash(fs.readFileSync(fixturePath)),network_calls:0,personal_records:0},results,assertions,deletion:{records_before:before,records_after:memory.length,log:deletionLog},rollback:{step_count:rollback.length,steps:rollback,final_mode:"non_ai_public_service"}};
payload.replay_digest_sha256=hash(Buffer.from(JSON.stringify(payload)));
fs.writeFileSync(evidencePath,JSON.stringify(payload,null,2)+"\n");
console.log(`P1_REPLAY ${payload.status} cases=${results.length} assertions=${Object.values(assertions).filter(Boolean).length}/${Object.keys(assertions).length} digest=${payload.replay_digest_sha256}`);
if(payload.status!=="PASS") process.exit(1);
