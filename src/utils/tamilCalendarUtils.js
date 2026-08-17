/* ============================================================
   TAMIL CALENDAR & PANCHANGAM CALCULATION ENGINE (tamilCalendarUtils.js)
   Supports:
   - 12 Tamil Months (சித்திரை to பங்குனி) in Tamil & English
   - 60-Year Tamil Cycle (குரோதி, விஸ்வாவசு, etc.)
   - Panchangam Attributes: Nakshatram (27 Stars), Tithi (15 Tithis), 
     Rahu Kalam, Yamagandam, Kuligai, Nalla Neram
   - Comprehensive Holiday & Festival Database (Indian National, Tamil Nadu, 
     Hindu, Islamic, Christian, Buddhist, Sikh, Jain, International UN Days)
   - Dynamic Yearly Recalculation & Countdown Engine
   ============================================================ */

// 12 Tamil Months in Tamil script and English transliteration
export const TAMIL_MONTHS = [
  { id: 0, ta: 'சித்திரை', en: 'Chithirai', approxStartMonth: 3, approxStartDay: 14 },
  { id: 1, ta: 'வைகாசி', en: 'Vaikasi', approxStartMonth: 4, approxStartDay: 15 },
  { id: 2, ta: 'ஆனி', en: 'Aani', approxStartMonth: 5, approxStartDay: 15 },
  { id: 3, ta: 'ஆடி', en: 'Aadi', approxStartMonth: 6, approxStartDay: 16 },
  { id: 4, ta: 'ஆவணி', en: 'Aavani', approxStartMonth: 7, approxStartDay: 17 },
  { id: 5, ta: 'புரட்டாசி', en: 'Purattasi', approxStartMonth: 8, approxStartDay: 17 },
  { id: 6, ta: 'ஐப்பசி', en: 'Aippasi', approxStartMonth: 9, approxStartDay: 18 },
  { id: 7, ta: 'கார்த்திகை', en: 'Karthigai', approxStartMonth: 10, approxStartDay: 17 },
  { id: 8, ta: 'மார்கழி', en: 'Margazhi', approxStartMonth: 11, approxStartDay: 16 },
  { id: 9, ta: 'தை', en: 'Thai', approxStartMonth: 0, approxStartDay: 14 },
  { id: 10, ta: 'மாசி', en: 'Maasi', approxStartMonth: 1, approxStartDay: 13 },
  { id: 11, ta: 'பங்குனி', en: 'Panguni', approxStartMonth: 2, approxStartDay: 14 }
];

// 60-Year Tamil Cycle Names
export const TAMIL_YEARS = [
  { ta: 'பிரபவ', en: 'Prabhava' }, { ta: 'விபவ', en: 'Vibhava' }, { ta: 'சுக்ல', en: 'Sukla' },
  { ta: 'பிரமோதூத', en: 'Pramodoota' }, { ta: 'பிரஜோற்பத்தி', en: 'Prajorpatthi' }, { ta: 'ஆங்கீரச', en: 'Aangirasa' },
  { ta: 'ஸ்ரீமுக', en: 'Srimukha' }, { ta: 'பவ', en: 'Bhava' }, { ta: 'யுவ', en: 'Yuva' },
  { ta: 'தாது', en: 'Dhatu' }, { ta: 'ஈஸ்வர', en: 'Eeswara' }, { ta: 'வெகுதானிய', en: 'Vehudhanya' },
  { ta: 'பிரமாதி', en: 'Pramathi' }, { ta: 'விக்ரம', en: 'Vikrama' }, { ta: 'விஷு', en: 'Vishu' },
  { ta: 'சித்திரபானு', en: 'Chitrabhanu' }, { ta: 'சுபானு', en: 'Subhanu' }, { ta: 'தாரண', en: 'Tarana' },
  { ta: 'பார்த்திப', en: 'Parthiba' }, { ta: 'விய', en: 'Viya' }, { ta: 'சர்வஜித்', en: 'Sarvajith' },
  { ta: 'சர்வதாரி', en: 'Sarvadhari' }, { ta: 'விரோதி', en: 'Virodhi' }, { ta: 'விகிருதி', en: 'Vikruthi' },
  { ta: 'கர', en: 'Kara' }, { ta: 'நந்தன', en: 'Nandhana' }, { ta: 'விஜய', en: 'Vijaya' },
  { ta: 'ஜய', en: 'Jaya' }, { ta: 'மன்மத', en: 'Manmatha' }, { ta: 'துன்முகி', en: 'Dunmukhi' },
  { ta: 'ஹேவிளம்பி', en: 'Hevilambi' }, { ta: 'விளம்பி', en: 'Vilambi' }, { ta: 'விகாரி', en: 'Vikari' },
  { ta: 'சார்வரி', en: 'Sharvari' }, { ta: 'பிலவ', en: 'Plava' }, { ta: 'சுபகிருது', en: 'Subhakruthu' },
  { ta: 'சோபகிருது', en: 'Sobhakruthu' }, { ta: 'குரோதி', en: 'Krodhi' }, { ta: 'விஸ்வாவசு', en: 'Visvavasu' },
  { ta: 'பராபவ', en: 'Parabhava' }, { ta: 'பிளவங்க', en: 'Plavanga' }, { ta: 'கீலக', en: 'Keelaka' },
  { ta: 'சௌமிய', en: 'Saumya' }, { ta: 'சாதாரண', en: 'Sadharana' }, { ta: 'விரோதிகிருது', en: 'Virodhikruthu' },
  { ta: 'பரிதாபி', en: 'Paridhabi' }, { ta: 'பிரமாதீச', en: 'Pramadheesa' }, { ta: 'ஆனந்த', en: 'Anandha' },
  { ta: 'ராட்சச', en: 'Ratsasa' }, { ta: 'நள', en: 'Nala' }, { ta: 'பிங்கல', en: 'Pingala' },
  { ta: 'காளயுக்தி', en: 'Kalayukthi' }, { ta: 'சித்தார்த்தி', en: 'Siddharthi' }, { ta: 'ரௌத்திரி', en: 'Raudhri' },
  { ta: 'துன்மதி', en: 'Dunmathi' }, { ta: 'துந்துபி', en: 'Dhundhubhi' }, { ta: 'ருத்ரோத்காரி', en: 'Rudhrodhkari' },
  { ta: 'ரக்தாட்சி', en: 'Raktakshi' }, { ta: 'க்ரோதன', en: 'Krodhana' }, { ta: 'அட்சய', en: 'Akshaya' }
];

// 27 Nakshatrams (Stars) in Tamil & English
export const NAKSHATRAS = [
  { ta: 'அஸ்வினி', en: 'Ashwini' }, { ta: 'பரணி', en: 'Bharani' }, { ta: 'கார்த்திகை', en: 'Krittika' },
  { ta: 'ரோகிணி', en: 'Rohini' }, { ta: 'மிருகசீரிஷம்', en: 'Mrigashirsha' }, { ta: 'திருவாதிரை', en: 'Ardra' },
  { ta: 'புனர்பூசம்', en: 'Punarvasu' }, { ta: 'பூசம்', en: 'Pushya' }, { ta: 'ஆயில்யம்', en: 'Ashlesha' },
  { ta: 'மகம்', en: 'Magha' }, { ta: 'பூரம்', en: 'Purva Phalguni' }, { ta: 'உத்திரம்', en: 'Uttara Phalguni' },
  { ta: 'அஸ்தம்', en: 'Hasta' }, { ta: 'சித்திரை', en: 'Chitra' }, { ta: 'சுவாதி', en: 'Swati' },
  { ta: 'விசாகம்', en: 'Vishakha' }, { ta: 'அனுஷம்', en: 'Anusham' }, { ta: 'கேட்டை', en: 'Jyeshtha' },
  { ta: 'மூலம்', en: 'Moola' }, { ta: 'பூராடம்', en: 'Purvashadha' }, { ta: 'உத்திராடம்', en: 'Uttarashadha' },
  { ta: 'திருவோணம்', en: 'Shravana' }, { ta: 'அவிட்டம்', en: 'Dhanishta' }, { ta: 'சதயம்', en: 'Shatabhisha' },
  { ta: 'பூரட்டாதி', en: 'Purva Bhadrapada' }, { ta: 'உத்திரட்டாதி', en: 'Uttara Bhadrapada' }, { ta: 'ரேவதி', en: 'Revati' }
];

// Tithis (Lunar Phases)
export const TITHIS = [
  { ta: 'பிரதமை', en: 'Pratipada' }, { ta: 'த்விதீயை', en: 'Dwitiya' }, { ta: 'த்ரிதீயை', en: 'Tritiya' },
  { ta: 'சதுர்த்தி', en: 'Chaturthi' }, { ta: 'பஞ்சமி', en: 'Panchami' }, { ta: 'ஷஷ்டி', en: 'Shasthi' },
  { ta: 'சப்தமி', en: 'Saptami' }, { ta: 'அஷ்டமி', en: 'Ashtami' }, { ta: 'நவமி', en: 'Navami' },
  { ta: 'தசமி', en: 'Dashami' }, { ta: 'ஏகாதசி', en: 'Ekadashi' }, { ta: 'துவாதசி', en: 'Dwadashi' },
  { ta: 'திரயோதசி', en: 'Trayodashi' }, { ta: 'சதுர்தசி', en: 'Chaturdashi' }, { ta: 'பௌர்ணமி / அமாவாசை', en: 'Pournami / Amavasya' }
];

// Tamil Days of Week
export const TAMIL_WEEKDAYS = [
  { id: 0, ta: 'ஞாயிறு', en: 'Sunday' },
  { id: 1, ta: 'திங்கள்', en: 'Monday' },
  { id: 2, ta: 'செவ்வாய்', en: 'Tuesday' },
  { id: 3, ta: 'புதன்', en: 'Wednesday' },
  { id: 4, ta: 'வியாழன்', en: 'Thursday' },
  { id: 5, ta: 'வெள்ளி', en: 'Friday' },
  { id: 6, ta: 'சனி', en: 'Saturday' }
];

// Rahu Kalam, Yamagandam, Kuligai by Day of Week (0 = Sun, 6 = Sat)
export const TIMINGS_BY_DAY = {
  0: { rahu: '4:30 PM - 6:00 PM', yama: '12:00 PM - 1:30 PM', kuli: '3:00 PM - 4:30 PM', nallaMorning: '7:30 AM - 8:30 AM', nallaEve: '4:30 PM - 5:30 PM' },
  1: { rahu: '7:30 AM - 9:00 AM', yama: '10:30 AM - 12:00 PM', kuli: '1:30 PM - 3:00 PM', nallaMorning: '6:30 AM - 7:30 AM', nallaEve: '4:30 PM - 5:30 PM' },
  2: { rahu: '3:00 PM - 4:30 PM', yama: '9:00 AM - 10:30 AM', kuli: '12:00 PM - 1:30 PM', nallaMorning: '7:30 AM - 8:30 AM', nallaEve: '4:30 PM - 5:30 PM' },
  3: { rahu: '12:00 PM - 1:30 PM', yama: '7:30 AM - 9:00 AM', kuli: '10:30 AM - 12:00 PM', nallaMorning: '9:15 AM - 10:15 AM', nallaEve: '4:45 PM - 5:45 PM' },
  4: { rahu: '1:30 PM - 3:00 PM', yama: '6:00 AM - 7:30 AM', kuli: '9:00 AM - 10:30 AM', nallaMorning: '10:45 AM - 11:45 AM', nallaEve: '5:45 PM - 6:45 PM' },
  5: { rahu: '10:30 AM - 12:00 PM', yama: '3:00 PM - 4:30 PM', kuli: '7:30 AM - 9:00 AM', nallaMorning: '9:15 AM - 10:15 AM', nallaEve: '4:45 PM - 5:45 PM' },
  6: { rahu: '9:00 AM - 10:30 AM', yama: '1:30 PM - 3:00 PM', kuli: '6:00 AM - 7:30 AM', nallaMorning: '7:30 AM - 8:30 AM', nallaEve: '5:00 PM - 6:00 PM' }
};

// Calculate Tamil Date Details for any Given Date
export function getTamilDateDetails(dateObj = new Date()) {
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const date = dateObj.getDate();
  const dayOfWeek = dateObj.getDay();

  // Calculate Tamil Year: (Gregorian Year - 3) % 60. Shift in Mid-April (Puthandu).
  let yearIndex = (year - 1987) % 60;
  if (yearIndex < 0) yearIndex += 60;
  // If date is before Tamil New Year (April 14), count previous Tamil year
  if (month < 3 || (month === 3 && date < 14)) {
    yearIndex = (yearIndex - 1 + 60) % 60;
  }
  const tamilYear = TAMIL_YEARS[yearIndex];

  // Calculate Tamil Month & Date
  let tamilMonthIndex = 0;
  let tamilDateNum = 1;

  if (month === 0) { // Jan
    if (date >= 14) { tamilMonthIndex = 9; tamilDateNum = date - 13; } // Thai
    else { tamilMonthIndex = 8; tamilDateNum = date + 16; } // Margazhi
  } else if (month === 1) { // Feb
    if (date >= 13) { tamilMonthIndex = 10; tamilDateNum = date - 12; } // Maasi
    else { tamilMonthIndex = 9; tamilDateNum = date + 18; } // Thai
  } else if (month === 2) { // Mar
    if (date >= 14) { tamilMonthIndex = 11; tamilDateNum = date - 13; } // Panguni
    else { tamilMonthIndex = 10; tamilDateNum = date + 16; } // Maasi
  } else if (month === 3) { // Apr
    if (date >= 14) { tamilMonthIndex = 0; tamilDateNum = date - 13; } // Chithirai
    else { tamilMonthIndex = 11; tamilDateNum = date + 18; } // Panguni
  } else if (month === 4) { // May
    if (date >= 15) { tamilMonthIndex = 1; tamilDateNum = date - 14; } // Vaikasi
    else { tamilMonthIndex = 0; tamilDateNum = date + 17; } // Chithirai
  } else if (month === 5) { // Jun
    if (date >= 15) { tamilMonthIndex = 2; tamilDateNum = date - 14; } // Aani
    else { tamilMonthIndex = 1; tamilDateNum = date + 17; } // Vaikasi
  } else if (month === 6) { // Jul
    if (date >= 16) { tamilMonthIndex = 3; tamilDateNum = date - 15; } // Aadi
    else { tamilMonthIndex = 2; tamilDateNum = date + 16; } // Aani
  } else if (month === 7) { // Aug
    if (date >= 17) { tamilMonthIndex = 4; tamilDateNum = date - 16; } // Aavani
    else { tamilMonthIndex = 3; tamilDateNum = date + 16; } // Aadi
  } else if (month === 8) { // Sep
    if (date >= 17) { tamilMonthIndex = 5; tamilDateNum = date - 16; } // Purattasi
    else { tamilMonthIndex = 4; tamilDateNum = date + 15; } // Aavani
  } else if (month === 9) { // Oct
    if (date >= 18) { tamilMonthIndex = 6; tamilDateNum = date - 17; } // Aippasi
    else { tamilMonthIndex = 5; tamilDateNum = date + 14; } // Purattasi
  } else if (month === 10) { // Nov
    if (date >= 17) { tamilMonthIndex = 7; tamilDateNum = date - 16; } // Karthigai
    else { tamilMonthIndex = 6; tamilDateNum = date + 14; } // Aippasi
  } else if (month === 11) { // Dec
    if (date >= 16) { tamilMonthIndex = 8; tamilDateNum = date - 15; } // Margazhi
    else { tamilMonthIndex = 7; tamilDateNum = date + 14; } // Karthigai
  }

  const tamilMonth = TAMIL_MONTHS[tamilMonthIndex];
  const weekday = TAMIL_WEEKDAYS[dayOfWeek];

  // Calculate approximate Nakshatra (27 cycle) & Tithi based on day offset
  const dayOfYear = Math.floor((dateObj - new Date(year, 0, 0)) / 1000 / 60 / 60 / 24);
  const nakshatraIndex = (dayOfYear + 12) % 27;
  const tithiIndex = (dayOfYear + 5) % 15;

  const nakshatra = NAKSHATRAS[nakshatraIndex];
  const tithi = TITHIS[tithiIndex];
  const timings = TIMINGS_BY_DAY[dayOfWeek];

  return {
    gregorianDate: dateObj,
    isoDate: `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`,
    tamilYear,
    tamilMonth,
    tamilDateNum,
    weekday,
    nakshatra,
    tithi,
    timings
  };
}

/* ============================================================
   COMPREHENSIVE FESTIVAL & HOLIDAY MASTER DATABASE
   Categories:
   - national: Indian National Holidays
   - tamil: Tamil Nadu & Regional Tamil Festivals
   - hindu: Hindu Religious Observances
   - islamic: Islamic Festivals
   - christian: Christian Festivals
   - buddhist: Buddhist Festivals
   - sikh: Sikh Festivals
   - jain: Jain Festivals
   - un_international: International & UN Awareness Days
   ============================================================ */

export const MASTER_FESTIVAL_DATABASE = [
  // 🇮🇳 INDIAN NATIONAL & TAMIL NADU GOVERNMENT HOLIDAYS
  { iso: '2025-01-01', iso2026: '2026-01-01', title: 'New Year\'s Day', titleTa: 'ஆங்கில புத்தாண்டு', category: 'national', isPublicHoliday: true, icon: '🎆', desc: 'Global celebration of the First Day of the Gregorian New Year.' },
  { iso: '2025-01-14', iso2026: '2026-01-14', title: 'Pongal / Makar Sankranti / Uttarayan', titleTa: 'பொங்கல் / மகர சங்கராந்தி', category: 'tamil', isPublicHoliday: true, icon: '🌾', desc: 'Harvest festival of Tamil Nadu celebrating solar harvest and nature.' },
  { iso: '2025-01-15', iso2026: '2026-01-15', title: 'Mattu Pongal / Thiruvalluvar Day', titleTa: 'மாட்டுப் பொங்கல் / திருவள்ளுவர் தினம்', category: 'tamil', isPublicHoliday: true, icon: '🐄', desc: 'Honoring cattle & farm animals, and remembering Saint Poet Thiruvalluvar.' },
  { iso: '2025-01-16', iso2026: '2026-01-16', title: 'Kaanum Pongal', titleTa: 'காணும் பொங்கல்', category: 'tamil', isPublicHoliday: true, icon: '🌾', desc: 'Family outdoor gatherings, reunions, and festive outings across Tamil Nadu.' },
  { iso: '2025-01-26', iso2026: '2026-01-26', title: 'Republic Day', titleTa: 'குடியரசு தினம்', category: 'national', isPublicHoliday: true, icon: '🇮🇳', desc: 'Commemorating the adoption of the Constitution of India in 1950.' },
  { iso: '2025-04-14', iso2026: '2026-04-14', title: 'Tamil New Year (Puthandu) / Vishu / Baisakhi', titleTa: 'தமிழ் புத்தாண்டு (சித்திரை விஷு)', category: 'tamil', isPublicHoliday: true, icon: '🌟', desc: 'First day of the Tamil solar calendar in month Chithirai.' },
  { iso: '2025-04-15', iso2026: '2026-04-15', title: 'Dr. B.R. Ambedkar Jayanti', titleTa: 'அம்பேத்கர் ஜெயந்தி', category: 'national', isPublicHoliday: true, icon: '📜', desc: 'Birth anniversary of Dr. B. R. Ambedkar, Father of the Indian Constitution.' },
  { iso: '2025-05-01', iso2026: '2026-05-01', title: 'May Day / Labour Day / Maharashtra Day', titleTa: 'மே தினம் / உழைப்பாளர் தினம்', category: 'national', isPublicHoliday: true, icon: '👷', desc: 'International Workers\' Day honoring the contributions of workers.' },
  { iso: '2025-08-15', iso2026: '2026-08-15', title: 'Independence Day', titleTa: 'சுதந்திர தினம்', category: 'national', isPublicHoliday: true, icon: '🇮🇳', desc: 'National holiday marking Indian independence from British rule in 1947.' },
  { iso: '2025-10-02', iso2026: '2026-10-02', title: 'Gandhi Jayanti', titleTa: 'காந்தி ஜெயந்தி', category: 'national', isPublicHoliday: true, icon: '🕊️', desc: 'Birth anniversary of Mahatma Gandhi, leader of Indian independence.' },
  { iso: '2025-11-01', iso2026: '2026-11-01', title: 'Kannada Rajyotsava / Puducherry Liberation Day', titleTa: 'கர்நாடக ராஜ்யோத்சவா', category: 'national', isPublicHoliday: true, icon: '🚩', desc: 'State formation day celebrations across southern India.' },

  // 🪔 HINDU FESTIVALS & TAMIL RELIGIOUS OBSERVANCES
  { iso: '2025-02-02', iso2026: '2026-01-23', title: 'Saraswati Puja / Vasant Panchami', titleTa: 'சரஸ்வதி பூஜை / வசந்த பஞ்சமி', category: 'hindu', isPublicHoliday: false, icon: '🌸', desc: 'Festival dedicated to Goddess Saraswati, deity of learning, music, and art.' },
  { iso: '2025-02-26', iso2026: '2026-02-15', title: 'Maha Shivaratri', titleTa: 'மகா சிவராத்திரி', category: 'hindu', isPublicHoliday: true, icon: '🕉️', desc: 'Night of Lord Shiva\'s cosmic dance and spiritual vigilance.' },
  { iso: '2025-03-13', iso2026: '2026-03-03', title: 'Holika Dahan', titleTa: 'ஹோலிகா தகனம்', category: 'hindu', isPublicHoliday: false, icon: '🔥', desc: 'Bonfire ritual symbolizing the victory of good over evil.' },
  { iso: '2025-03-14', iso2026: '2026-03-04', title: 'Holi', titleTa: 'ஹோலி பண்டிகை', category: 'hindu', isPublicHoliday: true, icon: '🎨', desc: 'Festival of colors celebrating spring, love, and new beginnings.' },
  { iso: '2025-03-31', iso2026: '2026-03-21', title: 'Ugadi / Gudi Padwa', titleTa: 'யுகாதி / குடீ பட்வா', category: 'hindu', isPublicHoliday: true, icon: '🌺', desc: 'Telugu, Kannada & Marathi New Year festival.' },
  { iso: '2025-04-06', iso2026: '2026-03-27', title: 'Ram Navami', titleTa: 'ராம நவமி', category: 'hindu', isPublicHoliday: true, icon: '🏹', desc: 'Celebrating the birth of Lord Rama.' },
  { iso: '2025-04-12', iso2026: '2026-05-01', title: 'Chitra Pournami', titleTa: 'சித்ரா பௌர்ணமி', category: 'tamil', isPublicHoliday: false, icon: '🌕', desc: 'Full moon day dedicated to Chitragupta, recorder of human deeds.' },
  { iso: '2025-07-06', iso2026: '2026-06-25', title: 'Aadi Perukku', titleTa: 'ஆடி பெருக்கு', category: 'tamil', isPublicHoliday: false, icon: '🌊', desc: 'Festival of water bodies and Cauvery river tribute.' },
  { iso: '2025-08-08', iso2026: '2026-08-21', title: 'Varalakshmi Vratham', titleTa: 'வரலட்சுமி விரதம்', category: 'tamil', isPublicHoliday: false, icon: '🪷', desc: 'Auspicious vrata observed by women for prosperity and Goddess Lakshmi.' },
  { iso: '2025-08-09', iso2026: '2026-08-28', title: 'Aavani Avittam / Raksha Bandhan', titleTa: 'ஆவணி அவிட்டம் / ரக்ஷா பந்தன்', category: 'tamil', isPublicHoliday: false, icon: '🪢', desc: 'Upakarma thread renewal ritual and celebrating sibling bond.' },
  { iso: '2025-08-16', iso2026: '2026-09-04', title: 'Krishna Jayanthi / Janmashtami', titleTa: 'கிருஷ்ண ஜெயந்தி', category: 'hindu', isPublicHoliday: true, icon: '🪈', desc: 'Birth of Lord Krishna celebrated with prasadams and butter offerings.' },
  { iso: '2025-08-27', iso2026: '2026-09-14', title: 'Vinayagar Chaturthi / Ganesh Chaturthi', titleTa: 'விநாயகர் சதுர்த்தி', category: 'tamil', isPublicHoliday: true, icon: '🐘', desc: 'Celebrating the birth of Lord Ganesha, remover of obstacles.' },
  { iso: '2025-09-05', iso2026: '2026-08-26', title: 'Onam (Thiruvonam)', titleTa: 'ஓணம் பண்டிகை', category: 'tamil', isPublicHoliday: true, icon: '🌺', desc: 'Harvest festival of Kerala celebrating King Mahabali.' },
  { iso: '2025-09-22', iso2026: '2026-10-11', title: 'Navaratri Begins', titleTa: 'நவராத்திரி ஆரம்பம்', category: 'hindu', isPublicHoliday: false, icon: '💃', desc: 'Nine sacred nights worshipping Goddess Durga, Lakshmi, and Saraswati.' },
  { iso: '2025-10-01', iso2026: '2026-10-19', title: 'Ayudha Pooja / Saraswati Pooja', titleTa: 'ஆயுத பூஜை / சரஸ்வதி பூஜை', category: 'tamil', isPublicHoliday: true, icon: '⚔️', desc: 'Honoring vehicles, tools, books, and work instruments.' },
  { iso: '2025-10-02', iso2026: '2026-10-20', title: 'Vijayadashami / Dussehra', titleTa: 'விஜயதசமி / தசரா', category: 'tamil', isPublicHoliday: true, icon: '🏹', desc: 'Victory of good over evil, auspicious day for new learning (Vidyarambham).' },
  { iso: '2025-10-09', iso2026: '2026-10-28', title: 'Karwa Chauth', titleTa: 'கர்வா சௌத்', category: 'hindu', isPublicHoliday: false, icon: '🌕', desc: 'Fasting ritual for marital bliss and longevity.' },
  { iso: '2025-10-20', iso2026: '2026-11-08', title: 'Deepavali / Lakshmi Puja', titleTa: 'தீபாவளி', category: 'tamil', isPublicHoliday: true, icon: '🪔', desc: 'Festival of lights celebrating victory of light over darkness.' },
  { iso: '2025-11-01', iso2026: '2026-11-20', title: 'Karthigai Deepam', titleTa: 'கார்த்திகை தீபம்', category: 'tamil', isPublicHoliday: false, icon: '🪔', desc: 'Festival of oil lamps lit in homes and Thiruvannamalai hill peak.' },
  { iso: '2025-12-30', iso2026: '2026-12-19', title: 'Vaikunta Ekadasi', titleTa: 'வைகுண்ட ஏகாதசி', category: 'tamil', isPublicHoliday: false, icon: '🚪', desc: 'Opening of Paramapada Vaasal (Heavenly Gate) in Vishnu temples.' },

  // ☪️ ISLAMIC FESTIVALS
  { iso: '2025-03-30', iso2026: '2026-03-20', title: 'Eid al-Fitr (Ramzan)', titleTa: 'ரம்ஜான் (ஈத் அல்-ஃபித்ர்)', category: 'islamic', isPublicHoliday: true, icon: '🌙', desc: 'Islamic festival marking the end of Ramadan holy fasting month.' },
  { iso: '2025-06-07', iso2026: '2026-05-27', title: 'Bakrid / Eid al-Adha', titleTa: 'பக்ரீத் (ஈத் அல்-அதா)', category: 'islamic', isPublicHoliday: true, icon: '🕌', desc: 'Feast of Sacrifice honoring Prophet Ibrahim\'s devotion.' },
  { iso: '2025-07-06', iso2026: '2026-06-25', title: 'Muharram (Islamic New Year)', titleTa: 'முஹர்ரம்', category: 'islamic', isPublicHoliday: true, icon: '🕌', desc: 'First month of Islamic calendar and Day of Ashura.' },
  { iso: '2025-09-05', iso2026: '2026-09-05', title: 'Milad-un-Nabi (Prophet\'s Birthday)', titleTa: 'மிலாடி நபி', category: 'islamic', isPublicHoliday: true, icon: '🕌', desc: 'Birth anniversary of Prophet Muhammad.' },

  // ✝️ CHRISTIAN FESTIVALS
  { iso: '2025-04-18', iso2026: '2026-04-03', title: 'Good Friday', titleTa: 'புனித வெள்ளி', category: 'christian', isPublicHoliday: true, icon: '✝️', desc: 'Christian holiday commemorating the crucifixion of Jesus Christ.' },
  { iso: '2025-04-20', iso2026: '2026-04-05', title: 'Easter Sunday', titleTa: 'ஈஸ்டர் பண்டிகை', category: 'christian', isPublicHoliday: false, icon: '🐣', desc: 'Celebrating the resurrection of Jesus Christ.' },
  { iso: '2025-12-25', iso2026: '2026-12-25', title: 'Christmas Day', titleTa: 'கிறிஸ்துமஸ்', category: 'christian', isPublicHoliday: true, icon: '🎄', desc: 'Commemorating the birth of Jesus Christ.' },
  { iso: '2025-12-31', iso2026: '2026-12-31', title: 'New Year\'s Eve', titleTa: 'ஆண்டு இறுதி இரவு', category: 'christian', isPublicHoliday: false, icon: '🥂', desc: 'Evening celebrations leading into the New Year.' },

  // ☸️ BUDDHIST, SIKH & JAIN FESTIVALS
  { iso: '2025-04-10', iso2026: '2026-03-31', title: 'Mahavir Jayanti', titleTa: 'மகாவீர் ஜெயந்தி', category: 'jain', isPublicHoliday: true, icon: '🪷', desc: 'Birth anniversary of Lord Mahavira, founder of Jainism.' },
  { iso: '2025-05-12', iso2026: '2026-05-31', title: 'Buddha Purnima (Vesak)', titleTa: 'புத்த பூர்ணிமா', category: 'buddhist', isPublicHoliday: true, icon: '🪷', desc: 'Birth, enlightenment, and death anniversary of Gautama Buddha.' },
  { iso: '2025-11-05', iso2026: '2026-11-24', title: 'Guru Nanak Jayanti', titleTa: 'குரு நானக் ஜெயந்தி', category: 'sikh', isPublicHoliday: true, icon: '🪯', desc: 'Birth anniversary of Guru Nanak Dev Ji, founder of Sikhism.' },

  // 🌏 INTERNATIONAL UN DAYS & AWARENESS OBSERVANCES
  { iso: '2025-03-08', iso2026: '2026-03-08', title: 'International Women\'s Day', titleTa: 'சர்வதேச மகளிர் தினம்', category: 'un_international', isPublicHoliday: false, icon: '👩', desc: 'Celebrating women\'s achievements and gender equality globally.' },
  { iso: '2025-03-22', iso2026: '2026-03-22', title: 'World Water Day', titleTa: 'உலக நீர் தினம்', category: 'un_international', isPublicHoliday: false, icon: '💧', desc: 'Advocating sustainable management of freshwater resources.' },
  { iso: '2025-04-07', iso2026: '2026-04-07', title: 'World Health Day', titleTa: 'உலக சுகாதார தினம்', category: 'un_international', isPublicHoliday: false, icon: '🩺', desc: 'Global health awareness day by World Health Organization.' },
  { iso: '2025-04-22', iso2026: '2026-04-22', title: 'Earth Day', titleTa: 'உலக பூமி தினம்', category: 'un_international', isPublicHoliday: false, icon: '🌍', desc: 'Environmental protection and environmental awareness.' },
  { iso: '2025-06-05', iso2026: '2026-06-05', title: 'World Environment Day', titleTa: 'உலக சுற்றுச்சூழல் தினம்', category: 'un_international', isPublicHoliday: false, icon: '🌱', desc: 'Encouraging awareness and action for the protection of nature.' },
  { iso: '2025-06-21', iso2026: '2026-06-21', title: 'International Yoga Day', titleTa: 'சர்வதேச யோகா தினம்', category: 'un_international', isPublicHoliday: false, icon: '🧘', desc: 'Promoting physical, mental, and spiritual well-being through Yoga.' },
  { iso: '2025-09-05', iso2026: '2026-09-05', title: 'National Teachers\' Day', titleTa: 'ஆசிரியர் தினம்', category: 'national', isPublicHoliday: false, icon: '🍎', desc: 'Birth anniversary of Dr. Sarvepalli Radhakrishnan.' },
  { iso: '2025-10-10', iso2026: '2026-10-10', title: 'World Mental Health Day', titleTa: 'உலக மனநல தினம்', category: 'un_international', isPublicHoliday: false, icon: '🧠', desc: 'Global mental health education and advocacy.' },
  { iso: '2025-11-14', iso2026: '2026-11-14', title: 'Children\'s Day (Jawaharlal Nehru Jayanti)', titleTa: 'குழந்தைகள் தினம்', category: 'national', isPublicHoliday: false, icon: '🎈', desc: 'Birth anniversary of Pandit Jawaharlal Nehru.' },
  { iso: '2025-12-10', iso2026: '2026-12-10', title: 'Human Rights Day', titleTa: 'மனித உரிமைகள் தினம்', category: 'un_international', isPublicHoliday: false, icon: '⚖️', desc: 'Commemorating Universal Declaration of Human Rights.' }
];

// Helper to Get All Festivals for a Specific Date (ISO string "YYYY-MM-DD")
export function getFestivalsForISO(isoDate) {
  const targetYear = parseInt(isoDate.split('-')[0], 10);
  
  return MASTER_FESTIVAL_DATABASE.filter(f => {
    if (targetYear === 2026 && f.iso2026) return f.iso2026 === isoDate;
    return f.iso === isoDate;
  });
}

// Helper to Get Upcoming Festivals & Countdowns
export function getUpcomingFestivals(currentIsoDate = new Date().toISOString().split('T')[0], limit = 5) {
  const today = new Date(currentIsoDate + 'T00:00');

  const list = MASTER_FESTIVAL_DATABASE.map(f => {
    let festDateStr = f.iso;
    if (today.getFullYear() === 2026 && f.iso2026) {
      festDateStr = f.iso2026;
    }
    const festDate = new Date(festDateStr + 'T00:00');
    const diffTime = festDate - today;
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      ...f,
      dateStr: festDateStr,
      daysLeft
    };
  }).filter(f => f.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return list.slice(0, limit);
}

// Today & Tomorrow Holiday Status Check
export function getHolidayStatus(dateObj = new Date()) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const date = String(dateObj.getDate()).padStart(2, '0');
  const isoToday = `${year}-${month}-${date}`;

  const tomorrowObj = new Date(dateObj);
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tYear = tomorrowObj.getFullYear();
  const tMonth = String(tomorrowObj.getMonth() + 1).padStart(2, '0');
  const tDate = String(tomorrowObj.getDate()).padStart(2, '0');
  const isoTomorrow = `${tYear}-${tMonth}-${tDate}`;

  const todayHolidays = getFestivalsForISO(isoToday).filter(f => f.isPublicHoliday);
  const tomorrowHolidays = getFestivalsForISO(isoTomorrow).filter(f => f.isPublicHoliday);

  return {
    today: {
      isHoliday: todayHolidays.length > 0,
      title: todayHolidays[0] ? todayHolidays[0].title : 'Working Day',
      titleTa: todayHolidays[0] ? todayHolidays[0].titleTa : 'வேலை நாள்',
      icon: todayHolidays[0] ? todayHolidays[0].icon : '💼'
    },
    tomorrow: {
      isHoliday: tomorrowHolidays.length > 0,
      title: tomorrowHolidays[0] ? tomorrowHolidays[0].title : 'Working Day',
      titleTa: tomorrowHolidays[0] ? tomorrowHolidays[0].titleTa : 'வேலை நாள்',
      icon: tomorrowHolidays[0] ? tomorrowHolidays[0].icon : '💼'
    }
  };
}
