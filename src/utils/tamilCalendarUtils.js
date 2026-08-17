/* ============================================================
   TAMIL CALENDAR & PANCHANGAM ENGINE (tamilCalendarUtils.js)
   100% English & Tanglish Transliteration Engine
   ============================================================ */

// 12 Tamil Months in English & Tanglish
export const TAMIL_MONTHS = [
  { id: 0, ta: 'Chithirai', en: 'Chithirai', approxStartMonth: 3, approxStartDay: 14 },
  { id: 1, ta: 'Vaikasi', en: 'Vaikasi', approxStartMonth: 4, approxStartDay: 15 },
  { id: 2, ta: 'Aani', en: 'Aani', approxStartMonth: 5, approxStartDay: 15 },
  { id: 3, ta: 'Aadi', en: 'Aadi', approxStartMonth: 6, approxStartDay: 16 },
  { id: 4, ta: 'Aavani', en: 'Aavani', approxStartMonth: 7, approxStartDay: 17 },
  { id: 5, ta: 'Purattasi', en: 'Purattasi', approxStartMonth: 8, approxStartDay: 17 },
  { id: 6, ta: 'Aippasi', en: 'Aippasi', approxStartMonth: 9, approxStartDay: 18 },
  { id: 7, ta: 'Karthigai', en: 'Karthigai', approxStartMonth: 10, approxStartDay: 17 },
  { id: 8, ta: 'Margazhi', en: 'Margazhi', approxStartMonth: 11, approxStartDay: 16 },
  { id: 9, ta: 'Thai', en: 'Thai', approxStartMonth: 0, approxStartDay: 14 },
  { id: 10, ta: 'Maasi', en: 'Maasi', approxStartMonth: 1, approxStartDay: 13 },
  { id: 11, ta: 'Panguni', en: 'Panguni', approxStartMonth: 2, approxStartDay: 14 }
];

// 60-Year Tamil Cycle Names in Tanglish
export const TAMIL_YEARS = [
  { ta: 'Prabhava', en: 'Prabhava' }, { ta: 'Vibhava', en: 'Vibhava' }, { ta: 'Sukla', en: 'Sukla' },
  { ta: 'Pramodoota', en: 'Pramodoota' }, { ta: 'Prajorpatthi', en: 'Prajorpatthi' }, { ta: 'Aangirasa', en: 'Aangirasa' },
  { ta: 'Srimukha', en: 'Srimukha' }, { ta: 'Bhava', en: 'Bhava' }, { ta: 'Yuva', en: 'Yuva' },
  { ta: 'Dhatu', en: 'Dhatu' }, { ta: 'Eeswara', en: 'Eeswara' }, { ta: 'Vehudhanya', en: 'Vehudhanya' },
  { ta: 'Pramathi', en: 'Pramathi' }, { ta: 'Vikrama', en: 'Vikrama' }, { ta: 'Vishu', en: 'Vishu' },
  { ta: 'Chitrabhanu', en: 'Chitrabhanu' }, { ta: 'Subhanu', en: 'Subhanu' }, { ta: 'Tarana', en: 'Tarana' },
  { ta: 'Parthiba', en: 'Parthiba' }, { ta: 'Viya', en: 'Viya' }, { ta: 'Sarvajith', en: 'Sarvajith' },
  { ta: 'Sarvadhari', en: 'Sarvadhari' }, { ta: 'Virodhi', en: 'Virodhi' }, { ta: 'Vikruthi', en: 'Vikruthi' },
  { ta: 'Kara', en: 'Kara' }, { ta: 'Nandhana', en: 'Nandhana' }, { ta: 'Vijaya', en: 'Vijaya' },
  { ta: 'Jaya', en: 'Jaya' }, { ta: 'Manmatha', en: 'Manmatha' }, { ta: 'Dunmukhi', en: 'Dunmukhi' },
  { ta: 'Hevilambi', en: 'Hevilambi' }, { ta: 'Vilambi', en: 'Vilambi' }, { ta: 'Vikari', en: 'Vikari' },
  { ta: 'Sharvari', en: 'Sharvari' }, { ta: 'Plava', en: 'Plava' }, { ta: 'Subhakruthu', en: 'Subhakruthu' },
  { ta: 'Sobhakruthu', en: 'Sobhakruthu' }, { ta: 'Krodhi', en: 'Krodhi' }, { ta: 'Visvavasu', en: 'Visvavasu' },
  { ta: 'Parabhava', en: 'Parabhava' }, { ta: 'Plavanga', en: 'Plavanga' }, { ta: 'Keelaka', en: 'Keelaka' },
  { ta: 'Saumya', en: 'Saumya' }, { ta: 'Sadharana', en: 'Sadharana' }, { ta: 'Virodhikruthu', en: 'Virodhikruthu' },
  { ta: 'Paridhabi', en: 'Paridhabi' }, { ta: 'Pramadheesa', en: 'Pramadheesa' }, { ta: 'Anandha', en: 'Anandha' },
  { ta: 'Ratsasa', en: 'Ratsasa' }, { ta: 'Nala', en: 'Nala' }, { ta: 'Pingala', en: 'Pingala' },
  { ta: 'Kalayukthi', en: 'Kalayukthi' }, { ta: 'Siddharthi', en: 'Siddharthi' }, { ta: 'Raudhri', en: 'Raudhri' },
  { ta: 'Dunmathi', en: 'Dunmathi' }, { ta: 'Dhundhubhi', en: 'Dhundhubhi' }, { ta: 'Rudhrodhkari', en: 'Rudhrodhkari' },
  { ta: 'Raktakshi', en: 'Raktakshi' }, { ta: 'Krodhana', en: 'Krodhana' }, { ta: 'Akshaya', en: 'Akshaya' }
];

// 27 Nakshatrams (Stars) in Tanglish
export const NAKSHATRAS = [
  { ta: 'Ashwini', en: 'Ashwini' }, { ta: 'Bharani', en: 'Bharani' }, { ta: 'Krittika', en: 'Krittika' },
  { ta: 'Rohini', en: 'Rohini' }, { ta: 'Mrigashirsha', en: 'Mrigashirsha' }, { ta: 'Ardra', en: 'Ardra' },
  { ta: 'Punarvasu', en: 'Punarvasu' }, { ta: 'Pushya', en: 'Pushya' }, { ta: 'Ashlesha', en: 'Ashlesha' },
  { ta: 'Magha', en: 'Magha' }, { ta: 'Purva Phalguni', en: 'Purva Phalguni' }, { ta: 'Uttara Phalguni', en: 'Uttara Phalguni' },
  { ta: 'Hasta', en: 'Hasta' }, { ta: 'Chitra', en: 'Chitra' }, { ta: 'Swati', en: 'Swati' },
  { ta: 'Vishakha', en: 'Vishakha' }, { ta: 'Anusham', en: 'Anusham' }, { ta: 'Jyeshtha', en: 'Jyeshtha' },
  { ta: 'Moola', en: 'Moola' }, { ta: 'Purvashadha', en: 'Purvashadha' }, { ta: 'Uttarashadha', en: 'Uttarashadha' },
  { ta: 'Shravana', en: 'Shravana' }, { ta: 'Dhanishta', en: 'Dhanishta' }, { ta: 'Shatabhisha', en: 'Shatabhisha' },
  { ta: 'Purva Bhadrapada', en: 'Purva Bhadrapada' }, { ta: 'Uttara Bhadrapada', en: 'Uttara Bhadrapada' }, { ta: 'Revati', en: 'Revati' }
];

// Tithis (Lunar Phases)
export const TITHIS = [
  { ta: 'Pratipada', en: 'Pratipada' }, { ta: 'Dwitiya', en: 'Dwitiya' }, { ta: 'Tritiya', en: 'Tritiya' },
  { ta: 'Chaturthi', en: 'Chaturthi' }, { ta: 'Panchami', en: 'Panchami' }, { ta: 'Shasthi', en: 'Shasthi' },
  { ta: 'Saptami', en: 'Saptami' }, { ta: 'Ashtami', en: 'Ashtami' }, { ta: 'Navami', en: 'Navami' },
  { ta: 'Dashami', en: 'Dashami' }, { ta: 'Ekadashi', en: 'Ekadashi' }, { ta: 'Dwadashi', en: 'Dwadashi' },
  { ta: 'Trayodashi', en: 'Trayodashi' }, { ta: 'Chaturdashi', en: 'Chaturdashi' }, { ta: 'Pournami / Amavasya', en: 'Pournami / Amavasya' }
];

// Days of Week in English / Tanglish
export const TAMIL_WEEKDAYS = [
  { id: 0, ta: 'Sunday', en: 'Sunday' },
  { id: 1, ta: 'Monday', en: 'Monday' },
  { id: 2, ta: 'Tuesday', en: 'Tuesday' },
  { id: 3, ta: 'Wednesday', en: 'Wednesday' },
  { id: 4, ta: 'Thursday', en: 'Thursday' },
  { id: 5, ta: 'Friday', en: 'Friday' },
  { id: 6, ta: 'Saturday', en: 'Saturday' }
];

// Rahu Kalam, Yamagandam, Kuligai by Day of Week
export const TIMINGS_BY_DAY = {
  0: { rahu: '4:30 PM - 6:00 PM', yama: '12:00 PM - 1:30 PM', kuli: '3:00 PM - 4:30 PM', nallaMorning: '7:30 AM - 8:30 AM', nallaEve: '4:30 PM - 5:30 PM' },
  1: { rahu: '7:30 AM - 9:00 AM', yama: '10:30 AM - 12:00 PM', kuli: '1:30 PM - 3:00 PM', nallaMorning: '6:30 AM - 7:30 AM', nallaEve: '4:30 PM - 5:30 PM' },
  2: { rahu: '3:00 PM - 4:30 PM', yama: '9:00 AM - 10:30 AM', kuli: '12:00 PM - 1:30 PM', nallaMorning: '7:30 AM - 8:30 AM', nallaEve: '4:30 PM - 5:30 PM' },
  3: { rahu: '12:00 PM - 1:30 PM', yama: '7:30 AM - 9:00 AM', kuli: '10:30 AM - 12:00 PM', nallaMorning: '9:15 AM - 10:15 AM', nallaEve: '4:45 PM - 5:45 PM' },
  4: { rahu: '1:30 PM - 3:00 PM', yama: '6:00 AM - 7:30 AM', kuli: '9:00 AM - 10:30 AM', nallaMorning: '10:45 AM - 11:45 AM', nallaEve: '5:45 PM - 6:45 PM' },
  5: { rahu: '10:30 AM - 12:00 PM', yama: '3:00 PM - 4:30 PM', kuli: '7:30 AM - 9:00 AM', nallaMorning: '9:15 AM - 10:15 AM', nallaEve: '4:45 PM - 5:45 PM' },
  6: { rahu: '9:00 AM - 10:30 AM', yama: '1:30 PM - 3:00 PM', kuli: '6:00 AM - 7:30 AM', nallaMorning: '7:30 AM - 8:30 AM', nallaEve: '5:00 PM - 6:00 PM' }
};

// Calculate Tanglish Date Details for any Given Date
export function getTamilDateDetails(dateObj = new Date()) {
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const date = dateObj.getDate();
  const dayOfWeek = dateObj.getDay();

  let yearIndex = (year - 1987) % 60;
  if (yearIndex < 0) yearIndex += 60;
  if (month < 3 || (month === 3 && date < 14)) {
    yearIndex = (yearIndex - 1 + 60) % 60;
  }
  const tamilYear = TAMIL_YEARS[yearIndex];

  let tamilMonthIndex = 0;
  let tamilDateNum = 1;

  if (month === 0) {
    if (date >= 14) { tamilMonthIndex = 9; tamilDateNum = date - 13; }
    else { tamilMonthIndex = 8; tamilDateNum = date + 16; }
  } else if (month === 1) {
    if (date >= 13) { tamilMonthIndex = 10; tamilDateNum = date - 12; }
    else { tamilMonthIndex = 9; tamilDateNum = date + 18; }
  } else if (month === 2) {
    if (date >= 14) { tamilMonthIndex = 11; tamilDateNum = date - 13; }
    else { tamilMonthIndex = 10; tamilDateNum = date + 16; }
  } else if (month === 3) {
    if (date >= 14) { tamilMonthIndex = 0; tamilDateNum = date - 13; }
    else { tamilMonthIndex = 11; tamilDateNum = date + 18; }
  } else if (month === 4) {
    if (date >= 15) { tamilMonthIndex = 1; tamilDateNum = date - 14; }
    else { tamilMonthIndex = 0; tamilDateNum = date + 17; }
  } else if (month === 5) {
    if (date >= 15) { tamilMonthIndex = 2; tamilDateNum = date - 14; }
    else { tamilMonthIndex = 1; tamilDateNum = date + 17; }
  } else if (month === 6) {
    if (date >= 16) { tamilMonthIndex = 3; tamilDateNum = date - 15; }
    else { tamilMonthIndex = 2; tamilDateNum = date + 16; }
  } else if (month === 7) {
    if (date >= 17) { tamilMonthIndex = 4; tamilDateNum = date - 16; }
    else { tamilMonthIndex = 3; tamilDateNum = date + 16; }
  } else if (month === 8) {
    if (date >= 17) { tamilMonthIndex = 5; tamilDateNum = date - 16; }
    else { tamilMonthIndex = 4; tamilDateNum = date + 15; }
  } else if (month === 9) {
    if (date >= 18) { tamilMonthIndex = 6; tamilDateNum = date - 17; }
    else { tamilMonthIndex = 5; tamilDateNum = date + 14; }
  } else if (month === 10) {
    if (date >= 17) { tamilMonthIndex = 7; tamilDateNum = date - 16; }
    else { tamilMonthIndex = 6; tamilDateNum = date + 14; }
  } else if (month === 11) {
    if (date >= 16) { tamilMonthIndex = 8; tamilDateNum = date - 15; }
    else { tamilMonthIndex = 7; tamilDateNum = date + 14; }
  }

  const tamilMonth = TAMIL_MONTHS[tamilMonthIndex];
  const weekday = TAMIL_WEEKDAYS[dayOfWeek];

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
   ENGLISH & TANGLISH MASTER FESTIVAL DATABASE
   ============================================================ */

export const MASTER_FESTIVAL_DATABASE = [
  // 🇮🇳 INDIAN NATIONAL & TAMIL NADU GOVERNMENT HOLIDAYS
  { iso: '2025-01-01', iso2026: '2026-01-01', title: 'New Year\'s Day', titleTa: 'New Year\'s Day', category: 'national', isPublicHoliday: true, icon: '🎆', desc: 'Global celebration of the First Day of the Gregorian New Year.' },
  { iso: '2025-01-14', iso2026: '2026-01-14', title: 'Pongal / Makar Sankranti / Uttarayan', titleTa: 'Thai Pongal', category: 'tamil', isPublicHoliday: true, icon: '🌾', desc: 'Harvest festival of Tamil Nadu celebrating solar harvest and nature.' },
  { iso: '2025-01-15', iso2026: '2026-01-15', title: 'Mattu Pongal / Thiruvalluvar Day', titleTa: 'Mattu Pongal', category: 'tamil', isPublicHoliday: true, icon: '🐄', desc: 'Honoring cattle & farm animals, and remembering Saint Poet Thiruvalluvar.' },
  { iso: '2025-01-16', iso2026: '2026-01-16', title: 'Kaanum Pongal', titleTa: 'Kaanum Pongal', category: 'tamil', isPublicHoliday: true, icon: '🌾', desc: 'Family outdoor gatherings, reunions, and festive outings across Tamil Nadu.' },
  { iso: '2025-01-26', iso2026: '2026-01-26', title: 'Republic Day', titleTa: 'Republic Day 🇮🇳', category: 'national', isPublicHoliday: true, icon: '🇮🇳', desc: 'Commemorating the adoption of the Constitution of India in 1950.' },
  { iso: '2025-04-14', iso2026: '2026-04-14', title: 'Tamil New Year (Puthandu) / Vishu / Baisakhi', titleTa: 'Tamil Puthandu', category: 'tamil', isPublicHoliday: true, icon: '🌟', desc: 'First day of the Tamil solar calendar in month Chithirai.' },
  { iso: '2025-04-15', iso2026: '2026-04-15', title: 'Dr. B.R. Ambedkar Jayanti', titleTa: 'Ambedkar Jayanti', category: 'national', isPublicHoliday: true, icon: '📜', desc: 'Birth anniversary of Dr. B. R. Ambedkar, Father of the Indian Constitution.' },
  { iso: '2025-05-01', iso2026: '2026-05-01', title: 'May Day / Labour Day', titleTa: 'May Day', category: 'national', isPublicHoliday: true, icon: '👷', desc: 'International Workers\' Day honoring the contributions of workers.' },
  { iso: '2025-08-15', iso2026: '2026-08-15', title: 'Independence Day', titleTa: 'Independence Day 🇮🇳', category: 'national', isPublicHoliday: true, icon: '🇮🇳', desc: 'National holiday marking Indian independence from British rule in 1947.' },
  { iso: '2025-10-02', iso2026: '2026-10-02', title: 'Gandhi Jayanti', titleTa: 'Gandhi Jayanti', category: 'national', isPublicHoliday: true, icon: '🕊️', desc: 'Birth anniversary of Mahatma Gandhi, leader of Indian independence.' },

  // 🪔 HINDU FESTIVALS & TAMIL OBSERVANCES
  { iso: '2025-02-02', iso2026: '2026-01-23', title: 'Saraswati Puja / Vasant Panchami', titleTa: 'Saraswati Puja', category: 'hindu', isPublicHoliday: false, icon: '🌸', desc: 'Festival dedicated to Goddess Saraswati, deity of learning and art.' },
  { iso: '2025-02-26', iso2026: '2026-02-15', title: 'Maha Shivaratri', titleTa: 'Maha Shivaratri', category: 'hindu', isPublicHoliday: true, icon: '🕉️', desc: 'Night of Lord Shiva\'s cosmic dance and spiritual vigilance.' },
  { iso: '2025-03-13', iso2026: '2026-03-03', title: 'Holika Dahan', titleTa: 'Holika Dahan', category: 'hindu', isPublicHoliday: false, icon: '🔥', desc: 'Bonfire ritual symbolizing the victory of good over evil.' },
  { iso: '2025-03-14', iso2026: '2026-03-04', title: 'Holi', titleTa: 'Holi', category: 'hindu', isPublicHoliday: true, icon: '🎨', desc: 'Festival of colors celebrating spring and new beginnings.' },
  { iso: '2025-03-31', iso2026: '2026-03-21', title: 'Ugadi / Gudi Padwa', titleTa: 'Ugadi', category: 'hindu', isPublicHoliday: true, icon: '🌺', desc: 'Telugu, Kannada & Marathi New Year festival.' },
  { iso: '2025-04-06', iso2026: '2026-03-27', title: 'Ram Navami', titleTa: 'Ram Navami', category: 'hindu', isPublicHoliday: true, icon: '🏹', desc: 'Celebrating the birth of Lord Rama.' },
  { iso: '2025-04-12', iso2026: '2026-05-01', title: 'Chitra Pournami', titleTa: 'Chitra Pournami', category: 'tamil', isPublicHoliday: false, icon: '🌕', desc: 'Full moon day dedicated to Chitragupta.' },
  { iso: '2025-07-06', iso2026: '2026-06-25', title: 'Aadi Perukku', titleTa: 'Aadi Perukku', category: 'tamil', isPublicHoliday: false, icon: '🌊', desc: 'Festival of water bodies and river tribute.' },
  { iso: '2025-08-08', iso2026: '2026-08-21', title: 'Varalakshmi Vratham', titleTa: 'Varalakshmi Vratham', category: 'tamil', isPublicHoliday: false, icon: '🪷', desc: 'Auspicious vrata for prosperity and Goddess Lakshmi.' },
  { iso: '2025-08-09', iso2026: '2026-08-28', title: 'Aavani Avittam / Raksha Bandhan', titleTa: 'Aavani Avittam', category: 'tamil', isPublicHoliday: false, icon: '🪢', desc: 'Upakarma thread renewal ritual and sibling bond.' },
  { iso: '2025-08-16', iso2026: '2026-09-04', title: 'Krishna Jayanthi / Janmashtami', titleTa: 'Krishna Jayanthi', category: 'hindu', isPublicHoliday: true, icon: '🪈', desc: 'Birth of Lord Krishna celebrated with prasadams.' },
  { iso: '2025-08-27', iso2026: '2026-09-14', title: 'Vinayagar Chaturthi', titleTa: 'Vinayagar Chaturthi', category: 'tamil', isPublicHoliday: true, icon: '🐘', desc: 'Celebrating the birth of Lord Ganesha.' },
  { iso: '2025-09-05', iso2026: '2026-08-26', title: 'Onam (Thiruvonam)', titleTa: 'Thiruvonam', category: 'tamil', isPublicHoliday: true, icon: '🌺', desc: 'Harvest festival celebrating King Mahabali.' },
  { iso: '2025-09-22', iso2026: '2026-10-11', title: 'Navaratri Begins', titleTa: 'Navaratri Begins', category: 'hindu', isPublicHoliday: false, icon: '💃', desc: 'Nine sacred nights worshipping Goddess Durga, Lakshmi, and Saraswati.' },
  { iso: '2025-10-01', iso2026: '2026-10-19', title: 'Ayudha Pooja / Saraswati Pooja', titleTa: 'Ayudha Pooja', category: 'tamil', isPublicHoliday: true, icon: '⚔️', desc: 'Honoring vehicles, tools, and work instruments.' },
  { iso: '2025-10-02', iso2026: '2026-10-20', title: 'Vijayadashami / Dussehra', titleTa: 'Vijayadashami', category: 'tamil', isPublicHoliday: true, icon: '🏹', desc: 'Victory of good over evil, day for Vidyarambham.' },
  { iso: '2025-10-09', iso2026: '2026-10-28', title: 'Karwa Chauth', titleTa: 'Karwa Chauth', category: 'hindu', isPublicHoliday: false, icon: '🌕', desc: 'Fasting ritual for marital bliss.' },
  { iso: '2025-10-20', iso2026: '2026-11-08', title: 'Deepavali', titleTa: 'Deepavali', category: 'tamil', isPublicHoliday: true, icon: '🪔', desc: 'Festival of lights celebrating victory of light over darkness.' },
  { iso: '2025-11-01', iso2026: '2026-11-20', title: 'Karthigai Deepam', titleTa: 'Karthigai Deepam', category: 'tamil', isPublicHoliday: false, icon: '🪔', desc: 'Festival of oil lamps lit in homes.' },
  { iso: '2025-12-30', iso2026: '2026-12-19', title: 'Vaikunta Ekadasi', titleTa: 'Vaikunta Ekadasi', category: 'tamil', isPublicHoliday: false, icon: '🚪', desc: 'Opening of Paramapada Vaasal in Vishnu temples.' },

  // ☪️ ISLAMIC FESTIVALS
  { iso: '2025-03-30', iso2026: '2026-03-20', title: 'Eid al-Fitr (Ramzan)', titleTa: 'Ramzan (Eid al-Fitr)', category: 'islamic', isPublicHoliday: true, icon: '🌙', desc: 'Islamic festival marking the end of Ramadan holy fasting month.' },
  { iso: '2025-06-07', iso2026: '2026-05-27', title: 'Bakrid / Eid al-Adha', titleTa: 'Bakrid', category: 'islamic', isPublicHoliday: true, icon: '🕌', desc: 'Feast of Sacrifice honoring Prophet Ibrahim\'s devotion.' },
  { iso: '2025-07-06', iso2026: '2026-06-25', title: 'Muharram', titleTa: 'Muharram', category: 'islamic', isPublicHoliday: true, icon: '🕌', desc: 'First month of Islamic calendar and Day of Ashura.' },
  { iso: '2025-09-05', iso2026: '2026-09-05', title: 'Milad-un-Nabi', titleTa: 'Milad-un-Nabi', category: 'islamic', isPublicHoliday: true, icon: '🕌', desc: 'Birth anniversary of Prophet Muhammad.' },

  // ✝️ CHRISTIAN FESTIVALS
  { iso: '2025-04-18', iso2026: '2026-04-03', title: 'Good Friday', titleTa: 'Good Friday', category: 'christian', isPublicHoliday: true, icon: '✝️', desc: 'Christian holiday commemorating the crucifixion of Jesus Christ.' },
  { iso: '2025-04-20', iso2026: '2026-04-05', title: 'Easter Sunday', titleTa: 'Easter Sunday', category: 'christian', isPublicHoliday: false, icon: '🐣', desc: 'Celebrating the resurrection of Jesus Christ.' },
  { iso: '2025-12-25', iso2026: '2026-12-25', title: 'Christmas Day', titleTa: 'Christmas Day', category: 'christian', isPublicHoliday: true, icon: '🎄', desc: 'Commemorating the birth of Jesus Christ.' },

  // 🌏 INTERNATIONAL UN DAYS
  { iso: '2025-03-08', iso2026: '2026-03-08', title: 'International Women\'s Day', titleTa: 'International Women\'s Day', category: 'un_international', isPublicHoliday: false, icon: '👩', desc: 'Celebrating women\'s achievements globally.' },
  { iso: '2025-04-22', iso2026: '2026-04-22', title: 'Earth Day', titleTa: 'Earth Day', category: 'un_international', isPublicHoliday: false, icon: '🌍', desc: 'Environmental protection awareness.' },
  { iso: '2025-06-21', iso2026: '2026-06-21', title: 'International Yoga Day', titleTa: 'International Yoga Day', category: 'un_international', isPublicHoliday: false, icon: '🧘', desc: 'Promoting physical, mental, and spiritual well-being.' }
];

export function getFestivalsForISO(isoDate) {
  const targetYear = parseInt(isoDate.split('-')[0], 10);
  return MASTER_FESTIVAL_DATABASE.filter(f => {
    if (targetYear === 2026 && f.iso2026) return f.iso2026 === isoDate;
    return f.iso === isoDate;
  });
}

export function getUpcomingFestivals(currentIsoDate = new Date().toISOString().split('T')[0], limit = 5) {
  const today = new Date(currentIsoDate + 'T00:00');
  return MASTER_FESTIVAL_DATABASE.map(f => {
    let festDateStr = f.iso;
    if (today.getFullYear() === 2026 && f.iso2026) festDateStr = f.iso2026;
    const festDate = new Date(festDateStr + 'T00:00');
    const diffTime = festDate - today;
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { ...f, dateStr: festDateStr, daysLeft };
  }).filter(f => f.daysLeft >= 0).sort((a, b) => a.daysLeft - b.daysLeft).slice(0, limit);
}

export function getHolidayStatus(dateObj = new Date()) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const date = String(dateObj.getDate()).padStart(2, '0');
  const isoToday = `${year}-${month}-${date}`;

  const todayHolidays = getFestivalsForISO(isoToday).filter(f => f.isPublicHoliday);
  return {
    today: {
      isHoliday: todayHolidays.length > 0,
      title: todayHolidays[0] ? todayHolidays[0].title : 'Working Day',
      icon: todayHolidays[0] ? todayHolidays[0].icon : '💼'
    }
  };
}
