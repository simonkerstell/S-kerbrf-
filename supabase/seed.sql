-- Seed-data: Besiktningsmallarna från de bifogade dokumenten
-- Kör detta EFTER schema.sql

-- Mall 1: Renovering av lägenhet
insert into mallar (id, namn, beskrivning) values
  ('a1000000-0000-0000-0000-000000000001', 'Renovering av lägenhet', 'Checklista vid renovering av lägenhet (bostadsrätt). Adress: lgh nr, fullständig adress och innehavarens namn.');

insert into mall_steg (mall_id, ordning, rubrik, instruktion) values
  ('a1000000-0000-0000-0000-000000000001', 1, 'Entreprenör', 'Namn inkl org nr. Det skall presenteras eventuell arbetsledare/projektledare.'),
  ('a1000000-0000-0000-0000-000000000001', 2, 'Arbetsmiljöplan', 'Denna skall presenteras av huvudentreprenören.'),
  ('a1000000-0000-0000-0000-000000000001', 3, 'Certifikat', 'Relevanta certifikat för specifik renovering, tex Säkert vatten eller BKR-certifiering. Dessa dokument skall finnas på samtliga entreprenörer som utför arbete på arbetsplatsen.'),
  ('a1000000-0000-0000-0000-000000000001', 4, 'Bilder inför renovering', 'Här läggs bilder inför renovering in.'),
  ('a1000000-0000-0000-0000-000000000001', 5, 'Storlek på utrymmet (samtliga ytor)', 'Ange yta i kvm samt antal dörröppningar eller liknande. Ange takhöjd i m.'),
  ('a1000000-0000-0000-0000-000000000001', 6, 'Anslutningspunkter', 'Ange vilka samt eventuella avstängningsventiler (i UC) som skall användas.'),
  ('a1000000-0000-0000-0000-000000000001', 7, 'Intäckning (tätning av ventilation m.m.)', 'Bilder på intäckning i tex hiss, trapphus och anslutande ytor.'),
  ('a1000000-0000-0000-0000-000000000001', 8, 'Parkering/avfallsuppställning (tex container)', 'Ange parkering för eventuella företagsbilar/uppställningsplatser av tex container.'),
  ('a1000000-0000-0000-0000-000000000001', 9, 'Försäkringsbolag (på huvudentreprenören)', 'Ange försäkringsnummer. Om det är delad entreprenad skall samtliga försäkringsbolag anges.'),
  ('a1000000-0000-0000-0000-000000000001', 10, 'Avisering', 'Ange tidsplan samt presentera informationsblad för boende i BRF:en.'),
  ('a1000000-0000-0000-0000-000000000001', 11, 'Konstruktör', 'Ange vad konstruktören har kontrollerat (beräkningar). Vilken konstruktör som använts.'),
  ('a1000000-0000-0000-0000-000000000001', 12, 'Rivning', 'Ange egenkontroller samt fakturor/kvitton för deponi. Det skall presenteras vem/vilka som utfört arbetet, tex om lärlingar använts.'),
  ('a1000000-0000-0000-0000-000000000001', 13, 'Betongarbeten (tex håltagning i bjälklag)', 'Ange placering av hål samt underlag för håltagning. Efter utförda arbeten skall bilder och egenkontroller presenteras.'),
  ('a1000000-0000-0000-0000-000000000001', 14, 'Brandinstallationer', 'Ange vilket företag som konsulteras samt vem som utfört kontroll (besiktningsutlåtande).'),
  ('a1000000-0000-0000-0000-000000000001', 15, 'VVS', 'Ange företag (org nr) samt egenkontroller med bilder på utfört arbete. Det skall presenteras vem/vilka som utfört arbetet, tex om lärlingar använts.'),
  ('a1000000-0000-0000-0000-000000000001', 16, 'El', 'Ange företag (org nr) samt egenkontroller med bilder på utfört arbete. Det skall presenteras vem/vilka som utfört arbetet, tex om lärlingar använts.'),
  ('a1000000-0000-0000-0000-000000000001', 17, 'Ventilation', 'Ange företag (org nr) samt egenkontroller med bilder på utfört arbete. Det skall presenteras vem/vilka som utfört arbetet, tex om lärlingar använts.'),
  ('a1000000-0000-0000-0000-000000000001', 18, 'Färdigställande av golv, väggar och tak', 'Egenkontroller samt bilder på utfört arbete. Det skall presenteras vem/vilka som utfört arbetet, tex om lärlingar använts.'),
  ('a1000000-0000-0000-0000-000000000001', 19, 'Fuktspärr', 'Egenkontroller (kvalitetsdokument) samt bilder på utfört arbete, tex på rörgenomföringar i fuktspärren. Vilken hantverkare som applicerat fuktspärren samt fabrikat av fuktspärr.'),
  ('a1000000-0000-0000-0000-000000000001', 20, 'Plattsättning', 'Egenkontroller (kvalitetsdokument) samt bilder på utfört arbete. Det skall presenteras vem/vilka som utfört arbetet, tex om lärlingar använts.'),
  ('a1000000-0000-0000-0000-000000000001', 21, 'Matta (vägg eller golv)', 'Egenkontroller (kvalitetsdokument) samt bilder på utfört arbete. Det skall presenteras vem/vilka som utfört arbetet, tex om lärlingar använts.'),
  ('a1000000-0000-0000-0000-000000000001', 22, 'Målning', 'Egenkontroller samt bilder på utfört arbete. Det skall presenteras vem/vilka som utfört arbetet, tex om lärlingar använts.'),
  ('a1000000-0000-0000-0000-000000000001', 23, 'Komplettering (inredning eller köksstommar)', 'Egenkontroller samt bilder på utfört arbete. Det skall presenteras vem/vilka som utfört arbetet, tex om lärlingar använts.'),
  ('a1000000-0000-0000-0000-000000000001', 24, 'Besiktning', 'Besiktningsutlåtande för sakkunnig besiktningsman. Finns certifikat skall det presenteras.'),
  ('a1000000-0000-0000-0000-000000000001', 25, 'Städning', 'Egenkontroller samt bilder på utfört arbete. Det skall presenteras vem/vilka som utfört arbetet, tex om lärlingar använts.'),
  ('a1000000-0000-0000-0000-000000000001', 26, 'Slutsamråd', 'Protokoll från slutsamråd.'),
  ('a1000000-0000-0000-0000-000000000001', 27, 'Övrigt', 'Ange övrigt.'),
  ('a1000000-0000-0000-0000-000000000001', 28, 'Efterkontroll', 'Vid eventuella problem fylls orsak mm i här.'),
  ('a1000000-0000-0000-0000-000000000001', 29, 'Signering', 'Skall göras av samtliga entreprenörer som vistas på arbetsplatsen. (I piloten: ange namn som signatur.)');

-- Mall 2: Renovering av allmänna utrymmen
insert into mallar (id, namn, beskrivning) values
  ('a2000000-0000-0000-0000-000000000002', 'Renovering av allmänna utrymmen', 'Checklista vid renovering av allmänna ytor (BRF). Adress: BRF och vilket utrymme, tex tvättstuga, samt fullständig adress.');

insert into mall_steg (mall_id, ordning, rubrik, instruktion) values
  ('a2000000-0000-0000-0000-000000000002', 1, 'Entreprenör', 'Namn inkl org nr. Det skall presenteras eventuell arbetsledare/projektledare.'),
  ('a2000000-0000-0000-0000-000000000002', 2, 'Arbetsmiljöplan', 'Denna skall presenteras av huvudentreprenören.'),
  ('a2000000-0000-0000-0000-000000000002', 3, 'Certifikat', 'Relevanta certifikat för specifik renovering, tex Säkert vatten eller BKR-certifiering. Dessa dokument skall finnas på samtliga entreprenörer som utför arbete på arbetsplatsen.'),
  ('a2000000-0000-0000-0000-000000000002', 4, 'Bilder inför renovering', 'Här läggs bilder inför renovering in.'),
  ('a2000000-0000-0000-0000-000000000002', 5, 'Storlek på utrymmet (samtliga ytor)', 'Ange yta i kvm samt antal dörröppningar eller liknande. Ange takhöjd i m.'),
  ('a2000000-0000-0000-0000-000000000002', 6, 'Anslutningspunkter', 'Ange vilka samt eventuella avstängningsventiler (i UC) som skall användas.'),
  ('a2000000-0000-0000-0000-000000000002', 7, 'Intäckning (tätning av ventilation m.m.)', 'Bilder på intäckning i tex hiss, trapphus och anslutande ytor.'),
  ('a2000000-0000-0000-0000-000000000002', 8, 'Parkering/avfallsuppställning (tex container)', 'Ange parkering för eventuella företagsbilar/uppställningsplatser av tex container.'),
  ('a2000000-0000-0000-0000-000000000002', 9, 'Försäkringsbolag (på huvudentreprenören)', 'Ange försäkringsnummer. Om det är delad entreprenad skall samtliga försäkringsbolag anges.'),
  ('a2000000-0000-0000-0000-000000000002', 10, 'Avisering', 'Ange tidsplan samt presentera informationsblad för boende i BRF:en.'),
  ('a2000000-0000-0000-0000-000000000002', 11, 'Konstruktör', 'Ange vad konstruktören har kontrollerat (beräkningar). Vilken konstruktör som använts.'),
  ('a2000000-0000-0000-0000-000000000002', 12, 'Rivning', 'Ange egenkontroller samt fakturor/kvitton för deponi. Det skall presenteras vem/vilka som utfört arbetet, tex om lärlingar använts.'),
  ('a2000000-0000-0000-0000-000000000002', 13, 'Betongarbeten (tex håltagning i bjälklag)', 'Ange placering av hål samt underlag för håltagning. Efter utförda arbeten skall bilder och egenkontroller presenteras.'),
  ('a2000000-0000-0000-0000-000000000002', 14, 'Hiss', 'Ange entreprenör som skall utföra arbete samt presenteras vem/vilka som utfört arbetet, tex om lärlingar använts. Egenkontroller skall redovisas.'),
  ('a2000000-0000-0000-0000-000000000002', 15, 'Brandinstallationer', 'Ange vilket företag som konsulteras samt vem som utfört kontroll (besiktningsutlåtande).'),
  ('a2000000-0000-0000-0000-000000000002', 16, 'VVS', 'Ange företag (org nr) samt egenkontroller med bilder på utfört arbete. Det skall presenteras vem/vilka som utfört arbetet, tex om lärlingar använts.'),
  ('a2000000-0000-0000-0000-000000000002', 17, 'El', 'Ange företag (org nr) samt egenkontroller med bilder på utfört arbete. Det skall presenteras vem/vilka som utfört arbetet, tex om lärlingar använts.'),
  ('a2000000-0000-0000-0000-000000000002', 18, 'Ventilation', 'Ange företag (org nr) samt egenkontroller med bilder på utfört arbete. Det skall presenteras vem/vilka som utfört arbetet, tex om lärlingar använts.'),
  ('a2000000-0000-0000-0000-000000000002', 19, 'Fasadrenovering', 'Ange entreprenör samt presenteras vem/vilka som utfört arbetet, tex om lärlingar använts. Egenkontroller skall redovisas.'),
  ('a2000000-0000-0000-0000-000000000002', 20, 'Yttertakskonstruktion', 'Ange entreprenör samt presenteras vem/vilka som utfört arbetet, tex om lärlingar använts. Egenkontroller skall redovisas.'),
  ('a2000000-0000-0000-0000-000000000002', 21, 'Ställningsarbeten', 'Ange entreprenör samt presenteras vem/vilka som utfört arbetet, tex om lärlingar använts. Egenkontroller skall redovisas.'),
  ('a2000000-0000-0000-0000-000000000002', 22, 'Färdigställande av golv, väggar och tak', 'Egenkontroller samt bilder på utfört arbete. Det skall presenteras vem/vilka som utfört arbetet, tex om lärlingar använts.'),
  ('a2000000-0000-0000-0000-000000000002', 23, 'Fuktspärr', 'Egenkontroller (kvalitetsdokument) samt bilder på utfört arbete, tex på rörgenomföringar i fuktspärren. Vilken hantverkare som applicerat fuktspärren samt fabrikat av fuktspärr.'),
  ('a2000000-0000-0000-0000-000000000002', 24, 'Plattsättning', 'Egenkontroller (kvalitetsdokument) samt bilder på utfört arbete. Det skall presenteras vem/vilka som utfört arbetet, tex om lärlingar använts.'),
  ('a2000000-0000-0000-0000-000000000002', 25, 'Matta (vägg eller golv)', 'Egenkontroller (kvalitetsdokument) samt bilder på utfört arbete. Det skall presenteras vem/vilka som utfört arbetet, tex om lärlingar använts.'),
  ('a2000000-0000-0000-0000-000000000002', 26, 'Målning', 'Egenkontroller samt bilder på utfört arbete. Det skall presenteras vem/vilka som utfört arbetet, tex om lärlingar använts.'),
  ('a2000000-0000-0000-0000-000000000002', 27, 'Komplettering (uppsättning av inredning)', 'Egenkontroller samt bilder på utfört arbete. Det skall presenteras vem/vilka som utfört arbetet, tex om lärlingar använts.'),
  ('a2000000-0000-0000-0000-000000000002', 28, 'Besiktning', 'Besiktningsutlåtande för sakkunnig besiktningsman. Finns certifikat skall det presenteras.'),
  ('a2000000-0000-0000-0000-000000000002', 29, 'Städning', 'Egenkontroller samt bilder på utfört arbete. Det skall presenteras vem/vilka som utfört arbetet, tex om lärlingar använts.'),
  ('a2000000-0000-0000-0000-000000000002', 30, 'Slutsamråd', 'Protokoll från slutsamråd.'),
  ('a2000000-0000-0000-0000-000000000002', 31, 'Övrigt', 'Ange övrigt.'),
  ('a2000000-0000-0000-0000-000000000002', 32, 'Efterkontroll', 'Vid eventuella problem fylls orsak mm i här.'),
  ('a2000000-0000-0000-0000-000000000002', 33, 'Signering', 'Skall göras av samtliga entreprenörer som vistas på arbetsplatsen. (I piloten: ange namn som signatur.)');
