-- Branschregler per steg i Badrumsrenoverings-mallen (BBV 26:1, Säker Vatten 2026:1, GVK Säkra Våtrum, MVK, RBK)
-- Källor: bkr.se, sakervatten.se, gvk.se, vatrumsmalning.se, rbk.nu. Vilar på Boverkets byggregler (BFS 2024:8).
-- Körs i Supabase SQL-editorn. Idempotent (kan köras om).

do $$
declare m uuid := 'b2000000-0000-0000-0000-000000000002';
begin

update mall_steg set branschregler =
  'Arbetsmiljöplan (AMP) ska upprättas innan byggarbetsplatsen etableras enligt Arbetsmiljöverkets föreskrifter (AFS). Byggherren ansvarar för att den finns och hålls aktuell.'
where mall_id = m and ordning = 3;

update mall_steg set branschregler =
  'Kontrollera aktuella behörigheter: BKR/BBV (plattsättning), GVK (tätskikt och våtrumsmatta), Säker Vatten (VVS) samt MVK (våtrumsmålning). Behörigheterna är företags- eller personknutna och ska vara giltiga.'
where mall_id = m and ordning = 4;

update mall_steg set branschregler =
  'Säker Vatteninstallation 2026:1: avstängningsventiler och anslutningar ska vara åtkomliga och utförda enligt tillverkarens monteringsanvisningar.'
where mall_id = m and ordning = 8;

update mall_steg set branschregler =
  'Säker Vatteninstallation 2026:1. Arbetet ska utföras av auktoriserat VVS-företag med utbildade montörer. Montering enligt leverantörens monteringsanvisningar på svenska. Intyg om Säker Vatteninstallation ska lämnas.'
where mall_id = m and ordning = 14;

update mall_steg set branschregler =
  'Elarbete ska utföras av elinstallationsföretag registrerat hos Elsäkerhetsverket (elsäkerhetslagen 2016:1379). Egenkontroll enligt företagets egenkontrollprogram ska dokumenteras.'
where mall_id = m and ordning = 15;

update mall_steg set branschregler =
  'Boverkets byggregler: erforderligt frånluftsflöde och överluft ska säkerställas. Till- och frånluftsdon får inte byggas för eller sättas igen.'
where mall_id = m and ordning = 16;

update mall_steg set branschregler =
  'Boverkets byggregler: golvet ska ha fall mot godkänd golvbrunn i tätskiktsklass. Fall och tätt underlag ska kontrolleras före tätskikt.'
where mall_id = m and ordning = 17;

update mall_steg set branschregler =
  'RBK-auktoriserad fuktkontroll. Relativ fuktighet (RF) i betong ska ha nått godkänd nivå enligt tätskiktsleverantörens krav (normalt högst 85 % RF) innan tätskikt appliceras. Mätning med kalibrerad utrustning och dokumenterat protokoll.'
where mall_id = m and ordning = 18;

update mall_steg set branschregler =
  'BBV 26:1 (tätskikt under keramik) respektive GVK Säkra Våtrum (våtrumsmatta). Godkänt tätskiktssystem där systemets alla delar kommer från samma leverantör. Hela golvet samt väggar i duschzonen golv till tak ska tätskiktas. Appliceras av behörig hantverkare. Kvalitetsdokument/våtrumsintyg ska utfärdas.'
where mall_id = m and ordning = 19;

update mall_steg set branschregler =
  'BBV 26:1. Keramik monteras med tunnsättningsteknik i fästmassa på godkänt tätskikt. Utförs av BKR-behörigt företag. Byggkeramikrådets kvalitetsdokument ska lämnas.'
where mall_id = m and ordning = 20;

update mall_steg set branschregler =
  'GVK Säkra Våtrum. Våtrumsmatta på golv och/eller vägg ska monteras av GVK-auktoriserat företag. GVK-kvalitetsdokument (våtrumsintyg) ska utfärdas.'
where mall_id = m and ordning = 21;

update mall_steg set branschregler =
  'MVK (Måleribranschens Våtrumskontroll). Våtrumsmålning ska utföras av MVK-auktoriserat måleri. MVK-intyg ska lämnas.'
where mall_id = m and ordning = 22;

update mall_steg set branschregler =
  'Kontroll mot BBV, GVK, Säker Vatten och Boverkets byggregler av behörig besiktningsman. Kvalitetsdokument/våtrumsintyg samlas in och besiktningsutlåtande upprättas.'
where mall_id = m and ordning = 24;

end $$;
