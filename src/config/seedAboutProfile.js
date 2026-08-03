import pool from "./db.js";

const DEFAULT_PROFILE = {
  name: "الدكتور محمد لفريخي",
  title: "أستاذ جامعي متخصص في الفقه الإسلامي وأصوله والقانون المدني والعقاري",
  shortBio:
    "أستاذ جامعي، خريج جامعة القرويين وجامعة سيدي محمد بن عبد الله بفاس وجامعة محمد الخامس بالرباط. أستاذ بكلية العلوم القانونية والاقتصادية والاجتماعية بسلا، وأستاذ زائر لكرسي أصول الفقه بجامع القرويين، بخبرة تدريسية تمتد لنحو عشرين سنة.",
  fullBio: [
    "الدكتور محمد لفريخي أستاذ جامعي، خريج جامعة القرويين وجامعة سيدي محمد بن عبد الله بفاس وجامعة محمد الخامس بالرباط. يشغل منصب أستاذ بكلية العلوم القانونية والاقتصادية والاجتماعية بسلا، وأستاذ زائر لكرسي أصول الفقه بجامع القرويين.",
    "متخصص في الفقه الإسلامي وأصوله والقانون المدني والعقاري، وله خبرة في التدريس تمتد إلى نحو عشرين سنة، إلى جانب إسهامات علمية وأكاديمية متعددة على المستويين الوطني والدولي.",
  ],
  academicCareer: [
    "دكتوراه في الفقه الإسلامي من جامعة سيدي محمد بن عبد الله بفاس",
    "دكتوراه في القانون الخاص من جامعة محمد الخامس بالرباط",
    "شهادة العالمية للتعليم العتيق",
    "دبلوم الدراسات العليا المعمقة في أصول الفقه",
    "ماستر في قانون الالتزام التعاقدي والعقار",
    "الكفاءة والتأهيل بالمدرسة العليا للأساتذة بفاس",
  ],
  positions: [
    "عضو المجلس الأعلى للتربية والتكوين والبحث العلمي",
    "رئيس جمعية العلماء خريجي القرويين",
    "عضو محكم بمجموعة من المراكز والمؤسسات والمجلات العلمية",
    "مدير مجلة تشارك للدراسات الفقهية والقانونية والاقتصادية",
    "خبير ومستشار سابق في المالية التشاركية بالمغرب",
    "استاذ بكلية الحقوق بسلا",
  ],
  researchInterests: [
    "الفقه الإسلامي وأصوله",
    "القانون المدني والعقاري",
    "المالية التشاركية (الإسلامية)",
    "التحكيم والوساطة الاتفاقية",
    "برامج ومناهج التعليم العتيق",
    "تطوير البحث العلمي",
  ],
  contributions: [
    "أكثر من 20 مؤلفا، أغلبها مشترك، في مجالات الفقه والقانون",
    "تأطير عدة دورات تكوينية تربوية وبيداغوجية وقانونية للأطر الإدارية على المستوى الوطني",
    "تأطير وتنسيق دورات تكوينية في التحكيم والوساطة الاتفاقية، تفعيلا لشراكة منتدى الصحراء للحوار والثقافات ووزارة العدل",
    "خبير ومشارك في التأليف بالتعليم العتيق، وفي إعداد البرامج والمناهج والوثائق التربوية لدى وزارة الأوقاف والشؤون الإسلامية",
    "مشاركة في عدة مؤتمرات وندوات دولية ووطنية",
    'مشاركة في نافذة إذاعية: "القانون والناس" بإذاعة محمد السادس',
  ],
  contact: {
    email: "contact@dr-lafrikhi.ma",
    phone: "+212 5XX-XXXXXX",
    address: "كلية العلوم القانونية والاقتصادية والاجتماعية، سلا، المغرب",
    social: {
      facebook: "#",
      twitter: "#",
      youtube: "#",
      linkedin: "#",
    },
  },
};

export async function ensureAboutProfile() {
  const [rows] = await pool.query("SELECT COUNT(*) AS count FROM about_profile");
  if (rows[0].count > 0) return;

  await pool.query(
    `INSERT INTO about_profile
      (id, name, title, short_bio, full_bio, academic_career, positions, research_interests, contributions,
       contact_email, contact_phone, contact_address, social_facebook, social_twitter, social_youtube, social_linkedin)
     VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      DEFAULT_PROFILE.name,
      DEFAULT_PROFILE.title,
      DEFAULT_PROFILE.shortBio,
      DEFAULT_PROFILE.fullBio.join("\n"),
      DEFAULT_PROFILE.academicCareer.join("\n"),
      DEFAULT_PROFILE.positions.join("\n"),
      DEFAULT_PROFILE.researchInterests.join("\n"),
      DEFAULT_PROFILE.contributions.join("\n"),
      DEFAULT_PROFILE.contact.email,
      DEFAULT_PROFILE.contact.phone,
      DEFAULT_PROFILE.contact.address,
      DEFAULT_PROFILE.contact.social.facebook,
      DEFAULT_PROFILE.contact.social.twitter,
      DEFAULT_PROFILE.contact.social.youtube,
      DEFAULT_PROFILE.contact.social.linkedin,
    ]
  );

  console.log("Seeded default about_profile row from the professor's existing bio.");
}
