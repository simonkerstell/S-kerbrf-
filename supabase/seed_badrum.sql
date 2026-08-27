-- Mall: Badrumsrenovering (från Översättningsmall_checklista.docx)
insert into mallar (id, namn, beskrivning) values
  ('b2000000-0000-0000-0000-000000000002', 'Badrumsrenovering', 'Checklista för renovering av badrum i bostadsrätt. Ange lgh nr, fullständig adress och innehavarens namn.');

insert into mall_steg (mall_id, ordning, rubrik, instruktion) values
  ('b2000000-0000-0000-0000-000000000002', 1,  'Entreprenör',                        'Namn inkl org nr. samt skall här det stå vem som är byggherre.'),
  ('b2000000-0000-0000-0000-000000000002', 2,  'ID06 samt personalliggare (digital)', 'Samtliga hantverkare skall ha ID06 och loggas in i personalliggaren.'),
  ('b2000000-0000-0000-0000-000000000002', 3,  'Intyg på AMP',                        'Arbetsmiljöplan för objekt/entreprenör.'),
  ('b2000000-0000-0000-0000-000000000002', 4,  'Certifikat',                          'Relevanta certifikat för specifik renovering, tex Säkert vatten eller BKR-certifiering.'),
  ('b2000000-0000-0000-0000-000000000002', 5,  'Kontrakt',                            'Eventuellt kontrakt tex Hantverksformuläret.'),
  ('b2000000-0000-0000-0000-000000000002', 6,  'Bilder inför renovering',             'Dessa skall in före entreprenaden påbörjas.'),
  ('b2000000-0000-0000-0000-000000000002', 7,  'Storlek på utrymmet',                 'Ange kvadratmeter.'),
  ('b2000000-0000-0000-0000-000000000002', 8,  'Anslutningspunkter',                  'Ange vilka samt eventuella avstängningsventiler (i UC).'),
  ('b2000000-0000-0000-0000-000000000002', 9,  'Intäckning (tätning av ventilation m.m.)', 'Bilder på intäckning i tex hiss, trapphus och anslutande ytor.'),
  ('b2000000-0000-0000-0000-000000000002', 10, 'Parkering/avfallsuppställning (tex container)', 'Ange parkering för eventuella företagsbilar/uppställningsplatser av tex container.'),
  ('b2000000-0000-0000-0000-000000000002', 11, 'Försäkringsbolag (på entreprenören)', 'Ange försäkringsnummer.'),
  ('b2000000-0000-0000-0000-000000000002', 12, 'Avisering',                           'Ange tidsplan, avstängningar och information till övriga i byggnaden.'),
  ('b2000000-0000-0000-0000-000000000002', 13, 'Rivning',                             'Ange egenkontroller samt fakturor/kvitton för deponi.'),
  ('b2000000-0000-0000-0000-000000000002', 14, 'VVS',                                 'Ange företag (org nr) samt egenkontroller med bilder på utfört arbete av den enskilda hantverkaren.'),
  ('b2000000-0000-0000-0000-000000000002', 15, 'El',                                  'Ange företag (org nr) samt egenkontroller med bilder på utfört arbete av den enskilda hantverkaren.'),
  ('b2000000-0000-0000-0000-000000000002', 16, 'Ventilation',                         'Ange företag (org nr) samt egenkontroller med bilder på utfört arbete av den enskilda hantverkaren.'),
  ('b2000000-0000-0000-0000-000000000002', 17, 'Färdigställande av golv, väggar och tak', 'Egenkontroller samt bilder på utfört arbete.'),
  ('b2000000-0000-0000-0000-000000000002', 18, 'Fuktmätning av samtliga konstruktionsdelar', 'Bilder med FK och RH med godkända nivåer med kalibrerade verktyg.'),
  ('b2000000-0000-0000-0000-000000000002', 19, 'Fuktspärr',                           'Egenkontroller (kvalitetsdokument) samt bilder på utfört arbete. Vilken hantverkare som applicerat fuktspärren samt fabrikat av fuktspärr.'),
  ('b2000000-0000-0000-0000-000000000002', 20, 'Plattsättning',                       'Egenkontroller (kvalitetsdokument) samt bilder på utfört arbete. Vilken hantverkare som satt kakel/klinkers.'),
  ('b2000000-0000-0000-0000-000000000002', 21, 'Matta',                               'Egenkontroller (kvalitetsdokument) samt bilder på utfört arbete. Vilken hantverkare som satt mattan (enbart vid matta på vägg eller golv).'),
  ('b2000000-0000-0000-0000-000000000002', 22, 'Målning',                             'Egenkontroller samt bilder på utfört arbete.'),
  ('b2000000-0000-0000-0000-000000000002', 23, 'Komplettering (uppsättning av inredning)', 'Egenkontroller samt bilder på utfört arbete.'),
  ('b2000000-0000-0000-0000-000000000002', 24, 'Besiktning',                          'Besiktningsutlåtande av behörig fackman.'),
  ('b2000000-0000-0000-0000-000000000002', 25, 'Städning',                            'Egenkontroller samt bilder på utfört arbete.'),
  ('b2000000-0000-0000-0000-000000000002', 26, 'Deponi',                              'Kvitton eller fakturor.'),
  ('b2000000-0000-0000-0000-000000000002', 27, 'Digital signatur',                    'Signatur av ansvarig.'),
  ('b2000000-0000-0000-0000-000000000002', 28, 'Övrigt',                              'Ange övrigt.');
