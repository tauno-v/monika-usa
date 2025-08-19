/*
  Andmefail sisaldab kõiki eesti‑inglise fraase koos kategooriatega.
  Igale fraasile annab unikaalse ID genereerimine hiljem skriptis.
*/

// Algandmete massiiv. Käsitsi kureeritud reisifraasid.
const basePhrases = [
  // Lennujaam
  { estonian: 'Kus on check‑in laud?', english: 'Where is the check‑in desk?', category: 'lennujaam' },
  { estonian: 'Kus on turvakontroll?', english: 'Where is security check?', category: 'lennujaam' },
  { estonian: 'Kus on pagasilint?', english: 'Where is the baggage carousel?', category: 'lennujaam' },
  { estonian: 'Kas ma saan registreerida pagasit?', english: 'Can I check my luggage?', category: 'lennujaam' },
  { estonian: 'Kas lend on hilinenud?', english: 'Is the flight delayed?', category: 'lennujaam' },
  // Lennuk
  { estonian: 'Kas saan akna juures istuda?', english: 'Can I sit by the window?', category: 'lennuk' },
  { estonian: 'Kas saan vahetada oma istekohta?', english: 'Can I change my seat?', category: 'lennuk' },
  { estonian: 'Kas saaksite mulle vett tuua?', english: 'Could you bring me some water?', category: 'lennuk' },
  { estonian: 'Kui kaua lend kestab?', english: 'How long is the flight?', category: 'lennuk' },
  { estonian: 'Kas see on otse lend?', english: 'Is this a direct flight?', category: 'lennuk' },
  // Passikontroll
  { estonian: 'Siin on minu pass.', english: 'Here is my passport.', category: 'passikontroll' },
  { estonian: 'Mis põhjusel te külastate?', english: 'What is the purpose of your visit?', category: 'passikontroll' },
  { estonian: 'Ma olen turist.', english: 'I am a tourist.', category: 'passikontroll' },
  { estonian: 'Ma viibin kaks nädalat.', english: 'I will stay for two weeks.', category: 'passikontroll' },
  { estonian: 'Kas teil on tagasilennu pilet?', english: 'Do you have a return ticket?', category: 'passikontroll' },
  // Hotell
  { estonian: 'Mul on broneering.', english: 'I have a reservation.', category: 'hotell' },
  { estonian: 'Ma sooviksin sisse registreerida.', english: 'I would like to check in.', category: 'hotell' },
  { estonian: 'Mis kell on väljaregistreerimine?', english: 'What time is check‑out?', category: 'hotell' },
  { estonian: 'Kas hommikusöök on hinnas?', english: 'Is breakfast included?', category: 'hotell' },
  { estonian: 'Kas teil on tasuta wifi?', english: 'Do you have free Wi‑Fi?', category: 'hotell' },
  // Transport
  { estonian: 'Kus on bussipeatus?', english: 'Where is the bus stop?', category: 'transport' },
  { estonian: 'Kui palju takso sõit maksab?', english: 'How much does the taxi ride cost?', category: 'transport' },
  { estonian: 'Kas saate kutsuda takso?', english: 'Can you call a taxi?', category: 'transport' },
  { estonian: 'Kas see buss läheb kesklinna?', english: 'Does this bus go to downtown?', category: 'transport' },
  { estonian: 'Kus saab osta metroopiletit?', english: 'Where can I buy a subway ticket?', category: 'transport' },
  // Restoran
  { estonian: 'Kas teil on vaba laud kahele?', english: 'Do you have a table for two?', category: 'restoran' },
  { estonian: 'Tahaksin menüüd.', english: 'I would like the menu.', category: 'restoran' },
  { estonian: 'Kas soovitate midagi?', english: 'Do you recommend something?', category: 'restoran' },
  { estonian: 'Kas see roog on vürtsikas?', english: 'Is this dish spicy?', category: 'restoran' },
  { estonian: 'Aitäh, oli maitsev.', english: 'Thank you, it was delicious.', category: 'restoran' },
  // Pood
  { estonian: 'Kui palju see maksab?', english: 'How much does this cost?', category: 'pood' },
  { estonian: 'Kas see on allahindluses?', english: 'Is this on sale?', category: 'pood' },
  { estonian: 'Kas teil on seda teises suuruses?', english: 'Do you have this in another size?', category: 'pood' },
  { estonian: 'Kas ma saan maksta kaardiga?', english: 'Can I pay with card?', category: 'pood' },
  { estonian: 'Kas on võimalik seda tagastada?', english: 'Is it possible to return this?', category: 'pood' },
  // Tänav
  { estonian: 'Kus on lähim apteek?', english: 'Where is the nearest pharmacy?', category: 'tänav' },
  { estonian: 'Kas te saate mind aidata?', english: 'Can you help me?', category: 'tänav' },
  { estonian: 'Kuidas ma jõuan raudteejaama?', english: 'How do I get to the train station?', category: 'tänav' },
  { estonian: 'Mis kell on?', english: 'What time is it?', category: 'tänav' },
  { estonian: 'Kas saaksite foto teha?', english: 'Could you take a picture?', category: 'tänav' },
  // Hädaolukord
  { estonian: 'Ma vajan abi.', english: 'I need help.', category: 'hädaolukord' },
  { estonian: 'Helistage politseisse.', english: 'Call the police.', category: 'hädaolukord' },
  { estonian: 'Ma olen eksinud.', english: "I'm lost.", category: 'hädaolukord' },
  { estonian: 'Mul on kiireloomuline meditsiiniline probleem.', english: 'I have an urgent medical issue.', category: 'hädaolukord' },
  { estonian: 'Kus on lähim haigla?', english: 'Where is the nearest hospital?', category: 'hädaolukord' },
  // Auto rent
  { estonian: 'Soovin rentida autot.', english: 'I would like to rent a car.', category: 'Auto rent' },
  { estonian: 'Kas teil on automaatkäigukastiga autosid?', english: 'Do you have automatic transmission cars?', category: 'Auto rent' },
  { estonian: 'Kui palju see maksab päevas?', english: 'How much does it cost per day?', category: 'Auto rent' },
  { estonian: 'Kas hind sisaldab kindlustust?', english: 'Does the price include insurance?', category: 'Auto rent' },
  { estonian: 'Kus on bensiinijaam?', english: 'Where is a gas station?', category: 'Auto rent' },
  // Sõit & kütus
  { estonian: 'Tankisin maha.', english: 'I filled up the tank.', category: 'Sõit & kütus' },
  { estonian: 'Kas bensiinipump töötab?', english: 'Is the gas pump working?', category: 'Sõit & kütus' },
  { estonian: 'Mis on bensiini hind?', english: 'What is the price of gas?', category: 'Sõit & kütus' },
  { estonian: 'Kuidas ma saan maksta?', english: 'How can I pay?', category: 'Sõit & kütus' },
  { estonian: 'Kas see on õige kütus?', english: 'Is this the right fuel?', category: 'Sõit & kütus' },
  // Los Angeles
  { estonian: 'Kus on Hollywoodi sild?', english: 'Where is the Hollywood sign?', category: 'Los Angeles' },
  { estonian: 'Kus asub Santa Monica rand?', english: 'Where is Santa Monica beach?', category: 'Los Angeles' },
  { estonian: 'Kas oskate soovitada head taco kohta?', english: 'Can you recommend a good taco place?', category: 'Los Angeles' },
  { estonian: 'Kui pikk on sõit Downtownist Venice Beachile?', english: 'How long is the ride from Downtown to Venice Beach?', category: 'Los Angeles' },
  { estonian: 'Kas ma saan siit ühistranspordiga Universal Studiosse minna?', english: 'Can I take public transportation to Universal Studios from here?', category: 'Los Angeles' },
  // Las Vegas
  { estonian: 'Kus on Strip?', english: 'Where is the Strip?', category: 'Las Vegas' },
  { estonian: 'Millal algab Bellagio purskkaevu show?', english: 'When does the Bellagio fountain show start?', category: 'Las Vegas' },
  { estonian: 'Kus on lähim kasiino?', english: 'Where is the nearest casino?', category: 'Las Vegas' },
  { estonian: 'Kuidas jõuda Freemont Streetile?', english: 'How to get to Fremont Street?', category: 'Las Vegas' },
  { estonian: 'Kas siin on buffet?', english: 'Is there a buffet here?', category: 'Las Vegas' },
  // Viisakus
  { estonian: 'Palun.', english: 'Please.', category: 'Viisakus' },
  { estonian: 'Aitäh.', english: 'Thank you.', category: 'Viisakus' },
  { estonian: 'Vabandust.', english: 'Sorry.', category: 'Viisakus' },
  { estonian: 'Head päeva!', english: 'Have a nice day!', category: 'Viisakus' },
  { estonian: 'Vabandust, ma ei kuulnud.', english: "Sorry, I didn't hear.", category: 'Viisakus' },
];

// See massiiv muudetakse rakenduse laadimisel, et lisada unikaalsed ID‑d ja ajastamine.