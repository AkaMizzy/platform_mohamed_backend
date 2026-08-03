-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 03, 2026 at 10:35 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `lafrikhi_platform`
--

-- --------------------------------------------------------

--
-- Table structure for table `about_profile`
--

CREATE TABLE `about_profile` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `title` varchar(500) NOT NULL,
  `short_bio` text NOT NULL,
  `full_bio` longtext NOT NULL,
  `academic_career` longtext NOT NULL,
  `positions` longtext NOT NULL,
  `research_interests` longtext NOT NULL,
  `contributions` longtext NOT NULL,
  `contact_email` varchar(255) NOT NULL,
  `contact_phone` varchar(100) NOT NULL,
  `contact_address` varchar(500) NOT NULL,
  `social_facebook` varchar(500) DEFAULT NULL,
  `social_twitter` varchar(500) DEFAULT NULL,
  `social_youtube` varchar(500) DEFAULT NULL,
  `social_linkedin` varchar(500) DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `about_profile`
--

INSERT INTO `about_profile` (`id`, `name`, `title`, `short_bio`, `full_bio`, `academic_career`, `positions`, `research_interests`, `contributions`, `contact_email`, `contact_phone`, `contact_address`, `social_facebook`, `social_twitter`, `social_youtube`, `social_linkedin`, `updated_at`) VALUES
(1, 'الدكتور محمد لفريخي', 'أستاذ جامعي متخصص في الفقه الإسلامي وأصوله والقانون المدني والعقاري', 'أستاذ جامعي، خريج جامعة القرويين وجامعة سيدي محمد بن عبد الله بفاس وجامعة محمد الخامس بالرباط. أستاذ بكلية العلوم القانونية والاقتصادية والاجتماعية بسلا، وأستاذ زائر لكرسي أصول الفقه بجامع القرويين، بخبرة تدريسية تمتد لنحو عشرين سنة.', 'الدكتور محمد لفريخي أستاذ جامعي، خريج جامعة القرويين وجامعة سيدي محمد بن عبد الله بفاس وجامعة محمد الخامس بالرباط. يشغل منصب أستاذ بكلية العلوم القانونية والاقتصادية والاجتماعية بسلا، وأستاذ زائر لكرسي أصول الفقه بجامع القرويين.\nمتخصص في الفقه الإسلامي وأصوله والقانون المدني والعقاري، وله خبرة في التدريس تمتد إلى نحو عشرين سنة، إلى جانب إسهامات علمية وأكاديمية متعددة على المستويين الوطني والدولي.', 'دكتوراه في الفقه الإسلامي من جامعة سيدي محمد بن عبد الله بفاس\nدكتوراه في القانون الخاص من جامعة محمد الخامس بالرباط\nشهادة العالمية للتعليم العتيق\nدبلوم الدراسات العليا المعمقة في أصول الفقه\nماستر في قانون الالتزام التعاقدي والعقار\nالكفاءة والتأهيل بالمدرسة العليا للأساتذة بفاس', 'عضو المجلس الأعلى للتربية والتكوين والبحث العلمي\nرئيس جمعية العلماء خريجي القرويين\nعضو محكم بمجموعة من المراكز والمؤسسات والمجلات العلمية\nمدير مجلة تشارك للدراسات الفقهية والقانونية والاقتصادية\nخبير ومستشار سابق في المالية التشاركية بالمغرب\nاستاذ بكلية الحقوق بسلا', 'الفقه الإسلامي وأصوله\nالقانون المدني والعقاري\nالمالية التشاركية (الإسلامية)\nالتحكيم والوساطة الاتفاقية\nبرامج ومناهج التعليم العتيق\nتطوير البحث العلمي', 'أكثر من 20 مؤلفا، أغلبها مشترك، في مجالات الفقه والقانون\nتأطير عدة دورات تكوينية تربوية وبيداغوجية وقانونية للأطر الإدارية على المستوى الوطني\nتأطير وتنسيق دورات تكوينية في التحكيم والوساطة الاتفاقية، تفعيلا لشراكة منتدى الصحراء للحوار والثقافات ووزارة العدل\nخبير ومشارك في التأليف بالتعليم العتيق، وفي إعداد البرامج والمناهج والوثائق التربوية لدى وزارة الأوقاف والشؤون الإسلامية\nمشاركة في عدة مؤتمرات وندوات دولية ووطنية\nمشاركة في نافذة إذاعية: \"القانون والناس\" بإذاعة محمد السادس', 'mohamed_lafrikhi@gmail.com', '+212 641298620', 'كلية العلوم القانونية والاقتصادية والاجتماعية، سلا، المغرب', '#', '#', '#', '#', '2026-08-03 18:36:02');

-- --------------------------------------------------------

--
-- Table structure for table `articles`
--

CREATE TABLE `articles` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `content_type` enum('text','file') NOT NULL,
  `content_text` longtext DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `file_original_name` varchar(255) DEFAULT NULL,
  `file_mime_type` varchar(150) DEFAULT NULL,
  `file_size` int(10) UNSIGNED DEFAULT NULL,
  `thumbnail_path` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `articles`
--

INSERT INTO `articles` (`id`, `title`, `description`, `content_type`, `content_text`, `file_path`, `file_original_name`, `file_mime_type`, `file_size`, `thumbnail_path`, `created_at`, `updated_at`) VALUES
(1, 'C#', 'about c# studying', 'text', 'C# is a general-purpose high-level programming language supporting multiple paradigms. C# encompasses static typing, strong typing, lexically scoped, imperative, declarative, functional, generic, object-oriented, and component-oriented programming disciplines.', NULL, NULL, NULL, NULL, NULL, '2026-06-24 17:43:17', '2026-06-24 17:43:17'),
(2, 'Prepa soutenance', 'what i was preparing during my soutenance', 'file', NULL, '1782319438840-411638494.docx', 'Prepa_Soutenance.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', NULL, '1782319438840-411638494.png', '2026-06-24 17:43:59', '2026-06-24 17:43:59');

-- --------------------------------------------------------

--
-- Table structure for table `content_entries`
--

CREATE TABLE `content_entries` (
  `id` int(11) NOT NULL,
  `content_type` enum('article','opinion','reference','consultation','medical_guidance') NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `excerpt` text DEFAULT NULL,
  `content_html` longtext NOT NULL,
  `status` enum('draft','scheduled','published','archived') NOT NULL DEFAULT 'draft',
  `category` varchar(255) DEFAULT NULL,
  `tags` longtext DEFAULT NULL,
  `author_id` int(11) DEFAULT NULL,
  `author_name` varchar(255) NOT NULL,
  `publication_date` datetime DEFAULT NULL,
  `scheduled_at` datetime DEFAULT NULL,
  `featured_image_url` varchar(1000) DEFAULT NULL,
  `featured_image_alt` varchar(500) DEFAULT NULL,
  `featured_image_caption` text DEFAULT NULL,
  `seo_title` varchar(255) DEFAULT NULL,
  `seo_description` varchar(500) DEFAULT NULL,
  `template_key` varchar(100) DEFAULT NULL,
  `dynamic_fields` longtext DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lectures`
--

CREATE TABLE `lectures` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` longtext DEFAULT NULL,
  `youtube_url` varchar(500) DEFAULT NULL,
  `youtube_id` varchar(50) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `file_original_name` varchar(255) DEFAULT NULL,
  `file_mime_type` varchar(150) DEFAULT NULL,
  `file_size` int(10) UNSIGNED DEFAULT NULL,
  `thumbnail_path` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lectures`
--

INSERT INTO `lectures` (`id`, `title`, `description`, `youtube_url`, `youtube_id`, `location`, `file_path`, `file_original_name`, `file_mime_type`, `file_size`, `thumbnail_path`, `created_at`, `updated_at`) VALUES
(1, 'C#', 'C# is a general-purpose high-level programming language supporting multiple paradigms. C# encompasses static typing, strong typing, lexically scoped, imperative, declarative, functional, generic, object-oriented, and component-oriented programming disciplines.', 'https://www.youtube.com/watch?v=ravLFzIguCM&t=2s', 'ravLFzIguCM', 'rabat', NULL, NULL, NULL, NULL, NULL, '2026-06-22 17:10:05', '2026-06-22 17:10:05'),
(2, 'laravel', 'A framework for developers and agents.', NULL, NULL, 'casablanca', '1782187171994-555897261.pdf', '1782144630690-390114988.pdf', 'application/pdf', 4551124, '1782187171994-555897261.png', '2026-06-22 17:10:30', '2026-06-23 04:59:32'),
(3, 'SOA', '\"SOA\" most commonly refers to Service-Oriented Architecture in tech, a Statement of Account in finance, or the Society of Actuaries. Depending on your context, here is a quick breakdown of what you need to know.', 'https://www.youtube.com/watch?v=PA9RjHI463g&t=2s', 'PA9RjHI463g', 'rabat', '1782144679960-897842351.pdf', 'CHOUGDALI_SOA_WS.pdf', 'application/pdf', 1757199, NULL, '2026-06-22 17:11:19', '2026-06-22 17:11:19'),
(4, 'test docxx', 'sss', NULL, NULL, NULL, '1782187724172-8770981.docx', '1782150937161-456457869.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 31356, '1782187724172-8770981.png', '2026-06-22 18:55:37', '2026-06-23 05:08:44'),
(6, 'Youtubeee', 'you gwhdb hjsbdhjas', 'https://www.youtube.com/watch?v=qfaVc26iby0', 'qfaVc26iby0', 'Rabat', '1782400717217-423319533.pdf', 'Lettre de motivation.pdf', 'application/pdf', 230935, '1782400717217-423319533.png', '2026-06-25 16:18:38', '2026-06-25 16:18:38');

-- --------------------------------------------------------

--
-- Table structure for table `opinions`
--

CREATE TABLE `opinions` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` longtext NOT NULL,
  `category` enum('legal','social','educational','cultural','technology','public_affairs') NOT NULL,
  `topic` varchar(255) DEFAULT NULL,
  `cover_image_path` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `opinions`
--

INSERT INTO `opinions` (`id`, `title`, `content`, `category`, `topic`, `cover_image_path`, `created_at`, `updated_at`) VALUES
(1, 'sadsadsa', 'asdasdasdsaas\r\nsadsa\r\n\r\n\r\n\r\nsadsaasdassa', 'legal', 'mawdo3', NULL, '2026-07-24 19:00:17', '2026-07-24 19:00:17');

-- --------------------------------------------------------

--
-- Table structure for table `questions`
--

CREATE TABLE `questions` (
  `id` int(11) NOT NULL,
  `type` enum('consultation','guidance') NOT NULL,
  `sender_name` varchar(255) NOT NULL,
  `sender_email` varchar(255) DEFAULT NULL,
  `specialty` varchar(255) DEFAULT NULL,
  `study_level` varchar(100) DEFAULT NULL,
  `subject` varchar(500) DEFAULT NULL,
  `question` text NOT NULL,
  `answer` longtext DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('pending','answered') NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `answered_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `questions`
--

INSERT INTO `questions` (`id`, `type`, `sender_name`, `sender_email`, `specialty`, `study_level`, `subject`, `question`, `answer`, `is_published`, `status`, `created_at`, `answered_at`) VALUES
(1, 'guidance', 'hamzaa', NULL, NULL, 'ماستر', 'just a simple question', 'Ammm', NULL, 0, 'pending', '2026-06-29 18:22:16', NULL),
(2, 'guidance', 'sasas', NULL, NULL, 'إجازة', 'sadsa', 'sadasd', 'msdkl sandksandk ndksandksandkj asndkjasnkjdassaaaaaaad', 1, 'answered', '2026-06-29 18:22:33', '2026-06-30 18:16:45'),
(3, 'consultation', 'fdsffd', 'fsdfdfsdfsd@gmail.com', 'التحكيم والوساطة', NULL, NULL, 'dze?', NULL, 0, 'pending', '2026-06-30 23:55:36', NULL),
(4, 'guidance', 'dsfssfs', NULL, NULL, 'إجازة', 'sdvdv', 'dsvdv', NULL, 0, 'pending', '2026-06-30 23:56:34', NULL),
(5, 'consultation', 'asdsadsa', 'sasaas@gmajks.com', 'القانون العقاري', NULL, NULL, 'sadsadas', NULL, 0, 'pending', '2026-07-24 18:15:15', NULL),
(6, 'guidance', 'sadssadas', 'sadas@gmail.com', NULL, 'ماستر', 'sadsadas', 'sadsadas', NULL, 0, 'pending', '2026-07-24 18:15:33', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `references`
--

CREATE TABLE `references` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` longtext DEFAULT NULL,
  `source_type` enum('file','link') NOT NULL,
  `link_url` varchar(1000) DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `file_original_name` varchar(255) DEFAULT NULL,
  `file_mime_type` varchar(150) DEFAULT NULL,
  `thumbnail_path` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `references`
--

INSERT INTO `references` (`id`, `title`, `description`, `source_type`, `link_url`, `file_path`, `file_original_name`, `file_mime_type`, `thumbnail_path`, `created_at`, `updated_at`) VALUES
(1, 'خدمة إعداد وكتابة الأوراق العلمية', 'صياغة أكاديمية احترافية لبحثك!', 'link', 'https://researchable-sa.com/%D8%AE%D8%AF%D9%85%D8%A9-%D8%A5%D8%B9%D8%AF%D8%A7%D8%AF-%D9%88%D9%83%D8%AA%D8%A7%D8%A8%D8%A9-%D8%A7%D9%84%D8%A3%D9%88%D8%B1%D8%A7%D9%82-%D8%A7%D9%84%D8%B9%D9%84%D9%85%D9%8A%D8%A9/p1720494497', NULL, NULL, NULL, NULL, '2026-06-25 18:28:12', '2026-06-25 18:28:12'),
(2, 'تقرير التدريب الداخلي', NULL, 'file', NULL, '1782408549488-847296239.pdf', 'RapportStage.pdf', 'application/pdf', '1782408549488-847296239.png', '2026-06-25 18:29:10', '2026-06-25 18:29:10');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `created_at`, `updated_at`) VALUES
(1, 'mohamed lafrikhi', 'mohamed_lafrikhi@gmail.com', '$2b$10$7bRwEDgGg9WCCByhg22YzesTZWWLwAtsPvJQAy45Sho2Pd7Z/4XHC', '2026-06-22 17:08:15', '2026-06-22 17:08:15');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `about_profile`
--
ALTER TABLE `about_profile`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `articles`
--
ALTER TABLE `articles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `content_entries`
--
ALTER TABLE `content_entries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_content_entries_status` (`status`),
  ADD KEY `idx_content_entries_type` (`content_type`),
  ADD KEY `idx_content_entries_publication_date` (`publication_date`),
  ADD KEY `fk_content_entries_author` (`author_id`);

--
-- Indexes for table `lectures`
--
ALTER TABLE `lectures`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `opinions`
--
ALTER TABLE `opinions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `references`
--
ALTER TABLE `references`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `articles`
--
ALTER TABLE `articles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `content_entries`
--
ALTER TABLE `content_entries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `lectures`
--
ALTER TABLE `lectures`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `opinions`
--
ALTER TABLE `opinions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `references`
--
ALTER TABLE `references`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `content_entries`
--
ALTER TABLE `content_entries`
  ADD CONSTRAINT `fk_content_entries_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
