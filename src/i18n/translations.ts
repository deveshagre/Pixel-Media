import { SupportedLanguage } from '../types';

export interface TranslationDictionary {
  nav: {
    overview: string;
    portfolio: string;
    services: string;
    help: string;
    editor: string;
    logout: string;
    profile: string;
    clientPortal: string;
    phase2Badge: string;
  };
  overview: {
    welcome: string;
    subtitle: string;
    activeProjects: string;
    inReview: string;
    completed: string;
    supportTickets: string;
    quickActions: string;
    requestService: string;
    requestServiceDesc: string;
    viewPortfolio: string;
    viewPortfolioDesc: string;
    newTicket: string;
    newTicketDesc: string;
    recentProjects: string;
    allProjects: string;
    noProjectsTitle: string;
    noProjectsDesc: string;
    startFirstProject: string;
    status: string;
    deadline: string;
    progress: string;
  };
  statuses: {
    requested: string;
    in_progress: string;
    in_review: string;
    completed: string;
    cancelled: string;
    pending: string;
    open: string;
    resolved: string;
    closed: string;
  };
  categories: {
    all: string;
    video_editing: string;
    image_editing: string;
    audio_editing: string;
    esports_gaming: string;
    graphic_design: string;
    motion_graphics: string;
  };
  portfolio: {
    title: string;
    subtitle: string;
    filterAll: string;
    demoNote: string;
    scope: string;
    deliverables: string[];
    client: string;
    year: string;
    viewProject: string;
    closeModal: string;
  };
  services: {
    title: string;
    subtitle: string;
    turnaround: string;
    deliverablesTitle: string;
    workflowTitle: string;
    formatsTitle: string;
    requestThisService: string;
    requestModalTitle: string;
    formProjectTitle: string;
    formProjectTitlePlaceholder: string;
    formCategory: string;
    formUrgency: string;
    urgencyStandard: string;
    urgencyExpress: string;
    urgencyRush: string;
    formBudget: string;
    formAssetsUrl: string;
    formAssetsPlaceholder: string;
    formTargetFormat: string;
    formFormatPlaceholder: string;
    formDescription: string;
    formDescriptionPlaceholder: string;
    submitting: string;
    submitRequest: string;
    successMessage: string;
  };
  help: {
    title: string;
    subtitle: string;
    faqTab: string;
    contactTab: string;
    myTicketsTab: string;
    faqHeader: string;
    faqSubheader: string;
    formSubject: string;
    formCategory: string;
    formPriority: string;
    formMessage: string;
    priorityLow: string;
    priorityNormal: string;
    priorityHigh: string;
    priorityUrgent: string;
    submitTicket: string;
    ticketSuccess: string;
    noTickets: string;
    noTicketsDesc: string;
  };
  editorPlaceholder: {
    badge: string;
    title: string;
    tagline: string;
    description: string;
    backToDashboard: string;
    phaseNotice: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    feature3Title: string;
    feature3Desc: string;
  };
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    signupTitle: string;
    signupSubtitle: string;
    emailLabel: string;
    passwordLabel: string;
    fullNameLabel: string;
    companyLabel: string;
    loginButton: string;
    signupButton: string;
    googleButton: string;
    noAccount: string;
    haveAccount: string;
    signUpLink: string;
    logInLink: string;
    loggingIn: string;
    signingUp: string;
    demoHint: string;
    passwordRequirements: string;
  };
  common: {
    language: string;
    cancel: string;
    close: string;
    save: string;
    loading: string;
    error: string;
    success: string;
    required: string;
    details: string;
  };
  home: {
    heroBadge: string;
    heroTitlePrefix: string;
    heroTitleHighlight: string;
    heroSubtitle: string;
    launchTimeline: string;
    requestProject: string;
    explorePortfolio: string;
    studioSpecs: string;
    statDisciplines: string;
    statDelivery: string;
    statMasters: string;
    statPipeline: string;
    timelineTitle: string;
    timelineSubtitle: string;
    comparisonTitle: string;
    comparisonSubtitle: string;
    servicesTitle: string;
    servicesSubtitle: string;
    portfolioTitle: string;
    portfolioSubtitle: string;
    clientPortalCta: string;
    motionToggle: string;
    replayLogo: string;
    skipIntro: string;
  };
}

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    nav: {
      overview: 'Overview',
      portfolio: 'Portfolio',
      services: 'Editing Services',
      help: 'Help Center',
      editor: 'Editor',
      logout: 'Log out',
      profile: 'Client Account',
      clientPortal: 'Pixel Media',
      phase2Badge: 'Phase 2',
    },
    overview: {
      welcome: 'Welcome back',
      subtitle: 'Track your creative production pipeline, assets, and service deliverables.',
      activeProjects: 'Active Projects',
      inReview: 'Under Review',
      completed: 'Completed Work',
      supportTickets: 'Active Inquiries',
      quickActions: 'Quick Actions',
      requestService: 'Request New Service',
      requestServiceDesc: 'Start a high-end video, audio, or graphics order with custom specs.',
      viewPortfolio: 'Explore Portfolio',
      viewPortfolioDesc: 'Inspect curated creative work, benchmarks, and production case studies.',
      newTicket: 'Open Support Ticket',
      newTicketDesc: 'Get dedicated revisions, deadline assistance, or account help.',
      recentProjects: 'Production Pipeline',
      allProjects: 'All Projects',
      noProjectsTitle: 'No Active Projects Found',
      noProjectsDesc: 'You do not have any creative projects in queue. Start with a new service request.',
      startFirstProject: 'Order First Creative Project',
      status: 'Status',
      deadline: 'Deadline',
      progress: 'Progress',
    },
    statuses: {
      requested: 'Requested',
      in_progress: 'In Production',
      in_review: 'Under Review',
      completed: 'Completed',
      cancelled: 'Cancelled',
      pending: 'Pending',
      open: 'Open',
      resolved: 'Resolved',
      closed: 'Closed',
    },
    categories: {
      all: 'All Categories',
      video_editing: 'Video Editing',
      image_editing: 'Image Retouching',
      audio_editing: 'Audio Production',
      esports_gaming: 'Esports & Gaming',
      graphic_design: 'Graphic Design',
      motion_graphics: 'Motion Graphics',
    },
    portfolio: {
      title: 'Studio Showcase & Benchmarks',
      subtitle: 'Verified creative demonstrations across broadcast, brand campaigns, and esports productions.',
      filterAll: 'All Works',
      demoNote: 'Curated studio sample work — demonstrations for client review.',
      scope: 'Project Scope',
      deliverables: ['Final Master 4K', 'Social Crops (9:16, 1:1)', 'Project Archive'],
      client: 'Client',
      year: 'Year',
      viewProject: 'View Project Specs',
      closeModal: 'Close',
    },
    services: {
      title: 'Creative Services & Post-Production',
      subtitle: 'Select from our 6 specialized disciplines to scale your creative deliverables.',
      turnaround: 'Standard Turnaround',
      deliverablesTitle: 'Deliverables Included',
      workflowTitle: 'Production Workflow',
      formatsTitle: 'Supported Delivery Formats',
      requestThisService: 'Request This Service',
      requestModalTitle: 'Creative Service Request',
      formProjectTitle: 'Project Title / Campaign Name',
      formProjectTitlePlaceholder: 'e.g. Q4 Commercial Brand Anthem or Twitch Highlight Pack',
      formCategory: 'Service Discipline',
      formUrgency: 'Production Urgency',
      urgencyStandard: 'Standard (3-5 Days)',
      urgencyExpress: 'Express (48 Hours)',
      urgencyRush: 'Rush Priority (24 Hours)',
      formBudget: 'Budget Range (Optional)',
      formAssetsUrl: 'Cloud Assets Link (Drive / Dropbox / Box)',
      formAssetsPlaceholder: 'https://drive.google.com/... or raw footage links',
      formTargetFormat: 'Target Deliverable Specs',
      formFormatPlaceholder: 'e.g. 4K ProRes 422 + 1080x1920 MP4 for TikTok',
      formDescription: 'Creative Brief & Instructions',
      formDescriptionPlaceholder: 'Detail your creative vision, pacing, references, brand style, and notes...',
      submitting: 'Submitting Request...',
      submitRequest: 'Confirm & Dispatch Request',
      successMessage: 'Your creative request has been queued! Your producer will review it shortly.',
    },
    help: {
      title: 'Help Center & Client Support',
      subtitle: 'Find prompt answers regarding deliverables, turnaround speeds, and revision cycles.',
      faqTab: 'Frequently Asked Questions',
      contactTab: 'Direct Support Inquiry',
      myTicketsTab: 'My Inquiries History',
      faqHeader: 'Studio Knowledge Base',
      faqSubheader: 'Common answers for production workflows and asset handling.',
      formSubject: 'Inquiry Subject',
      formCategory: 'Inquiry Category',
      formPriority: 'Priority Level',
      formMessage: 'Detailed Message',
      priorityLow: 'Low',
      priorityNormal: 'Normal',
      priorityHigh: 'High',
      priorityUrgent: 'Urgent',
      submitTicket: 'Submit Inquiry',
      ticketSuccess: 'Support ticket submitted successfully. Our production lead has been notified.',
      noTickets: 'No Support Inquiries',
      noTicketsDesc: 'You have not submitted any inquiries. If you have questions, reach out via the form.',
    },
    editorPlaceholder: {
      badge: 'Phase 2 Architecture',
      title: 'Pixel Studio Web Suite',
      tagline: 'High-performance cloud video and graphics editor under active development.',
      description: 'Phase 1 delivers the authenticated client portal, asset management, and project tracking. The interactive browser-native timeline editor is scheduled for Phase 2 integration.',
      backToDashboard: 'Return to Client Dashboard',
      phaseNotice: 'This route is reserved for Phase 2. All client request and project operations are fully active in the portal.',
      feature1Title: 'Multi-Track Timeline',
      feature1Desc: 'Frame-accurate trimming, multi-layer audio mixing, and keyframe bezier control in WebGL.',
      feature2Title: 'Client Review Annotations',
      feature2Desc: 'Timecode-specific drawing and comments directly synchronized with editors in real time.',
      feature3Title: 'Hardware Acceleration',
      feature3Desc: 'Zero-latency preview via WebCodecs and GPU-accelerated canvas compositing.',
    },
    auth: {
      loginTitle: 'Sign in to Pixel Media',
      loginSubtitle: 'Access your private client dashboard and ongoing production pipelines.',
      signupTitle: 'Create Client Account',
      signupSubtitle: 'Get immediate access to dedicated creative services and asset pipelines.',
      emailLabel: 'Work Email Address',
      passwordLabel: 'Password',
      fullNameLabel: 'Full Name',
      companyLabel: 'Company / Organization (Optional)',
      loginButton: 'Sign In to Portal',
      signupButton: 'Create Client Account',
      googleButton: 'Continue with Google OAuth',
      noAccount: "Don't have a client account?",
      haveAccount: 'Already have an account?',
      signUpLink: 'Register here',
      logInLink: 'Sign in here',
      loggingIn: 'Authenticating...',
      signingUp: 'Creating account...',
      demoHint: '💡 Quick Test Mode: Enter any valid email/password to evaluate the portal instantly.',
      passwordRequirements: 'Minimum 6 characters required.',
    },
    common: {
      language: 'Language',
      cancel: 'Cancel',
      close: 'Close',
      save: 'Save',
      loading: 'Loading...',
      error: 'An unexpected error occurred.',
      success: 'Operation completed successfully.',
      required: 'Required',
      details: 'View Details',
    },
    home: {
      heroBadge: '4K/8K Finishing • ACEScc Color • EBU R128 Mastered',
      heroTitlePrefix: 'Post-Production Engineered For',
      heroTitleHighlight: 'Visionary Creators.',
      heroSubtitle: 'The high-precision creative post-production studio for cinematic commercials, beauty retouching, esports highlights, and 3D motion systems.',
      launchTimeline: 'Launch Timeline Demo',
      requestProject: 'Request Creative Project',
      explorePortfolio: 'Explore Portfolio',
      studioSpecs: 'Hardware Acceleration // WebCodecs // 60fps Native Playback',
      statDisciplines: '6 Production Specializations',
      statDelivery: '99.4% On-Time Delivery Rate',
      statMasters: 'ProRes 4444 & 16-Bit RAW',
      statPipeline: 'Active Production Pipeline',
      timelineTitle: 'Interactive Timeline Engine',
      timelineSubtitle: 'Experience our professional nonlinear timeline demonstration. Play, scrub, inspect clips, and observe real-time timecode updates.',
      comparisonTitle: 'Precision Grade & Retouching',
      comparisonSubtitle: 'Drag the split slider to evaluate raw sensor captures versus Pixel Media final graded and retouched masters.',
      servicesTitle: 'Creative Services Explorer',
      servicesSubtitle: 'Inspect our 6 turnkey disciplines with live delivery specifications, turnaround times, and workflow stages.',
      portfolioTitle: 'Cinematic Work Showcase',
      portfolioSubtitle: 'Selected commercial campaigns, editorial retouching, tournament recaps, and 3D motion sequences.',
      clientPortalCta: 'Enter Client Dashboard',
      motionToggle: 'Reduced Motion',
      replayLogo: 'Replay Brand Intro',
      skipIntro: 'Skip Intro',
    },
  },

  hi: {
    nav: {
      overview: 'अवलोकन (Overview)',
      portfolio: 'पोर्टफोलियो (Portfolio)',
      services: 'संपादन सेवाएं (Services)',
      help: 'सहायता केंद्र (Help)',
      editor: 'एडिटर (Editor)',
      logout: 'लॉग आउट',
      profile: 'ग्राहक खाता',
      clientPortal: 'पिक्सेल मीडिया',
      phase2Badge: 'चरण 2',
    },
    overview: {
      welcome: 'वापसी पर स्वागत है',
      subtitle: 'अपनी रचनात्मक उत्पादन पाइपलाइन, संपत्तियों और परियोजना वितरण को ट्रैक करें।',
      activeProjects: 'सक्रिय परियोजनाएं',
      inReview: 'समीक्षाधीन',
      completed: 'पूर्ण कार्य',
      supportTickets: 'सक्रिय प्रश्न',
      quickActions: 'त्वरित कार्रवाई',
      requestService: 'नई सेवा का अनुरोध करें',
      requestServiceDesc: 'कस्टम विशिष्टताओं के साथ उच्च-स्तरीय वीडियो, ऑडियो या ग्राफिक्स ऑर्डर शुरू करें।',
      viewPortfolio: 'पोर्टफोलियो देखें',
      viewPortfolioDesc: 'क्यूरेट किए गए रचनात्मक कार्य, बेंचमार्क और केस स्टडी देखें।',
      newTicket: 'समर्थन टिकट खोलें',
      newTicketDesc: 'संशोधन, समय सीमा सहायता या खाता सहायता प्राप्त करें।',
      recentProjects: 'उत्पादन पाइपलाइन',
      allProjects: 'सभी परियोजनाएं',
      noProjectsTitle: 'कोई सक्रिय परियोजना नहीं मिली',
      noProjectsDesc: 'आपकी कतार में कोई रचनात्मक परियोजना नहीं है। नई सेवा अनुरोध के साथ प्रारंभ करें।',
      startFirstProject: 'पहला रचनात्मक प्रोजेक्ट ऑर्डर करें',
      status: 'स्थिति',
      deadline: 'अंतिम तिथि',
      progress: 'प्रगति',
    },
    statuses: {
      requested: 'अनुरोधित',
      in_progress: 'उत्पादन में',
      in_review: 'समीक्षाधीन',
      completed: 'पूर्ण',
      cancelled: 'रद्द',
      pending: 'लंबित',
      open: 'खुला',
      resolved: 'समाधानित',
      closed: 'बंद',
    },
    categories: {
      all: 'सभी श्रेणियां',
      video_editing: 'वीडियो संपादन',
      image_editing: 'छवि सुधार',
      audio_editing: 'ऑडियो उत्पादन',
      esports_gaming: 'ईस्पोर्ट्स और गेमिंग',
      graphic_design: 'ग्राफिक डिजाइन',
      motion_graphics: 'मोशन ग्राफिक्स',
    },
    portfolio: {
      title: 'स्टूडियो शोकेस और बेंचमार्क',
      subtitle: 'प्रसारण, ब्रांड अभियानों और ईस्पोर्ट्स प्रस्तुतियों में सत्यापित रचनात्मक कार्य।',
      filterAll: 'सभी कार्य',
      demoNote: 'स्टूडियो नमूना कार्य — ग्राहक समीक्षा के लिए प्रदर्शन।',
      scope: 'परियोजना का दायरा',
      deliverables: ['अंतिम मास्टर 4K', 'सोशल क्रॉप्स', 'प्रोजेक्ट संग्रह'],
      client: 'ग्राहक',
      year: 'वर्ष',
      viewProject: 'परियोजना विवरण देखें',
      closeModal: 'बंद करें',
    },
    services: {
      title: 'रचनात्मक सेवाएं और पोस्ट-प्रोडक्शन',
      subtitle: 'अपने प्रोजेक्ट को आगे बढ़ाने के लिए हमारे 6 विशेष विभागों में से चुनें।',
      turnaround: 'मानक टर्नअराउंड समय',
      deliverablesTitle: 'शामिल डिलीवरी',
      workflowTitle: 'उत्पादन कार्यप्रवाह',
      formatsTitle: 'समर्थित प्रारूप',
      requestThisService: 'इस सेवा का अनुरोध करें',
      requestModalTitle: 'रचनात्मक सेवा अनुरोध',
      formProjectTitle: 'परियोजना शीर्षक / अभियान का नाम',
      formProjectTitlePlaceholder: 'उदा. ब्रांड विज्ञापन या ईस्पोर्ट्स हाइलाइट पैक',
      formCategory: 'सेवा अनुशासन',
      formUrgency: 'उत्पादन तात्कालिकता',
      urgencyStandard: 'मानक (3-5 दिन)',
      urgencyExpress: 'एक्सप्रेस (48 घंटे)',
      urgencyRush: 'तत्काल प्राथमिकता (24 घंटे)',
      formBudget: 'बजट सीमा (वैकल्पिक)',
      formAssetsUrl: 'क्लाउड एसेट्स लिंक (Drive / Dropbox)',
      formAssetsPlaceholder: 'https://drive.google.com/...',
      formTargetFormat: 'लक्षित प्रारूप',
      formFormatPlaceholder: 'उदा. 4K ProRes 422 + 1080x1920 MP4',
      formDescription: 'रचनात्मक विवरण और निर्देश',
      formDescriptionPlaceholder: 'अपनी रचनात्मक दृष्टि, संदर्भ और निर्देश विस्तार से लिखें...',
      submitting: 'अनुरोध सबमिट हो रहा है...',
      submitRequest: 'पुष्टि करें और अनुरोध भेजें',
      successMessage: 'आपका अनुरोध दर्ज हो गया है! हमारा निर्माता जल्द ही समीक्षा करेगा।',
    },
    help: {
      title: 'सहायता केंद्र और ग्राहक सहायता',
      subtitle: 'डिलीवरी, टर्नअराउंड समय और संशोधन चक्र के बारे में तुरंत उत्तर पाएं।',
      faqTab: 'अक्सर पूछे जाने वाले प्रश्न (FAQ)',
      contactTab: 'सीधा सहायता अनुरोध',
      myTicketsTab: 'मेरे अनुरोधों का इतिहास',
      faqHeader: 'स्टूडियो नॉलेज बेस',
      faqSubheader: 'उत्पादन कार्यप्रवाह और फाइलों के प्रबंधन के सामान्य उत्तर।',
      formSubject: 'पूछताछ विषय',
      formCategory: 'श्रेणी',
      formPriority: 'प्राथमिकता स्तर',
      formMessage: 'विस्तृत संदेश',
      priorityLow: 'कम',
      priorityNormal: 'सामान्य',
      priorityHigh: 'उच्च',
      priorityUrgent: 'अति आवश्यक',
      submitTicket: 'पूछताछ सबमिट करें',
      ticketSuccess: 'समर्थन टिकट सफलतापूर्वक सबमिट किया गया।',
      noTickets: 'कोई सहायता पूछताछ नहीं',
      noTicketsDesc: 'आपने कोई पूछताछ दर्ज नहीं की है। यदि आपके कोई प्रश्न हैं, तो फॉर्म भरें।',
    },
    editorPlaceholder: {
      badge: 'चरण 2 वास्तुकला',
      title: 'पिक्सेल स्टूडियो वेब सूट',
      tagline: 'सक्रिय विकास के तहत उच्च-प्रदर्शन क्लाउड वीडियो और ग्राफिक्स संपादक।',
      description: 'चरण 1 क्लाइंट पोर्टल और प्रोजेक्ट ट्रैकिंग प्रदान करता है। इंटरैक्टिव ब्राउज़र-मूल संपादक चरण 2 एकीकरण के लिए निर्धारित है।',
      backToDashboard: 'क्लाइंट डैशबोर्ड पर लौटें',
      phaseNotice: 'यह मार्ग चरण 2 के लिए आरक्षित है। सभी अनुरोध और परियोजनाएं पोर्टल में सक्रिय हैं।',
      feature1Title: 'मल्टी-ट्रैक टाइमलाइन',
      feature1Desc: 'WebGL में सटीक ट्रिमिंग, मल्टी-लेयर ऑडियो मिक्सिंग और कीफ्रेम नियंत्रण।',
      feature2Title: 'क्लाइंट समीक्षा टिप्पणियां',
      feature2Desc: 'टाइमकोड-विशिष्ट ड्रॉइंग और वास्तविक समय में समन्वयित टिप्पणियां।',
      feature3Title: 'हार्डवेयर त्वरण',
      feature3Desc: 'WebCodecs और GPU-त्वरित कैनवास के माध्यम से शून्य-विलंबता पूर्वावलोकन।',
    },
    auth: {
      loginTitle: 'पिक्सेल मीडिया में साइन इन करें',
      loginSubtitle: 'अपने निजी ग्राहक डैशबोर्ड और उत्पादन पाइपलाइन तक पहुंचें।',
      signupTitle: 'ग्राहक खाता बनाएं',
      signupSubtitle: 'समर्पित रचनात्मक सेवाओं और पाइपलाइनों तक तुरंत पहुंच प्राप्त करें।',
      emailLabel: 'कार्य ईमेल पता',
      passwordLabel: 'पासवर्ड',
      fullNameLabel: 'पूरा नाम',
      companyLabel: 'कंपनी / संगठन (वैकल्पिक)',
      loginButton: 'पोर्टल में साइन इन करें',
      signupButton: 'ग्राहक खाता बनाएं',
      googleButton: 'Google OAuth के साथ जारी रखें',
      noAccount: 'क्या आपके पास खाता नहीं है?',
      haveAccount: 'क्या आपके पास पहले से खाता है?',
      signUpLink: 'यहाँ पंजीकरण करें',
      logInLink: 'यहाँ साइन इन करें',
      loggingIn: 'प्रमाणीकरण हो रहा है...',
      signingUp: 'खाता बनाया जा रहा है...',
      demoHint: '💡 त्वरित परीक्षण मोड: पोर्टल का तुरंत मूल्यांकन करने के लिए कोई भी मान्य ईमेल दर्ज करें।',
      passwordRequirements: 'न्यूनतम 6 वर्ण आवश्यक हैं।',
    },
    common: {
      language: 'भाषा',
      cancel: 'रद्द करें',
      close: 'बंद करें',
      save: 'सहेजें',
      loading: 'लोड हो रहा है...',
      error: 'एक अप्रत्याशित त्रुटि हुई।',
      success: 'ऑपरेशन सफलतापूर्वक पूरा हुआ।',
      required: 'आवश्यक',
      details: 'विवरण देखें',
    },
    home: {
      heroBadge: '4K/8K फिनिशिंग • ACEScc कलर • EBU R128 मास्टर',
      heroTitlePrefix: 'सिनेमैटिक विजन के लिए निर्मित',
      heroTitleHighlight: 'उच्च स्तरीय पोस्ट-प्रोडक्शन।',
      heroSubtitle: 'व्यावसायिक विज्ञापनों, हाई-एंड इमेज सुधार, ईस्पोर्ट्स रील्स और 3D मोशन के लिए विश्वस्तरीय संपादन स्टूडियो।',
      launchTimeline: 'टाइमलाइन डेमो चलाएं',
      requestProject: 'नया प्रोजेक्ट अनुरोध करें',
      explorePortfolio: 'पोर्टफोलियो देखें',
      studioSpecs: 'हार्डवेयर त्वरण // वेबकोडेक्स // 60fps नेटिव प्लेबैक',
      statDisciplines: '6 विशेष संपादन श्रेणियां',
      statDelivery: '99.4% समय पर डिलीवरी दर',
      statMasters: 'ProRes 4444 और 16-बिट रॉ',
      statPipeline: 'सक्रिय उत्पादन पाइपलाइन',
      timelineTitle: 'इंटरैक्टिव टाइमलाइन इंजन',
      timelineSubtitle: 'हमारे पेशेवर गैर-रेखीय संपादन टाइमलाइन का अनुभव करें। प्ले करें, स्क्रब करें और रीयल-टाइम टाइमकोड देखें।',
      comparisonTitle: 'सटीक ग्रेड और रीटच तुलना',
      comparisonSubtitle: 'रॉ सेंसर कैप्चर और पिक्सेल मीडिया के अंतिम मास्टर के बीच अंतर देखने के लिए स्लाइडर खींचें।',
      servicesTitle: 'क्रिएटिव सर्विसेज एक्सप्लोरर',
      servicesSubtitle: 'लाइव डिलीवरी विनिर्देशों, समय और वर्कफ़्लो चरणों के साथ हमारी 6 श्रेणियों का अन्वेषण करें।',
      portfolioTitle: 'सिनेमैटिक पोर्टफोलियो शोकेस',
      portfolioSubtitle: 'चुनिंदा वाणिज्यिक अभियान, सौंदर्य सुधार, टूर्नामेंट रीकैप्स और 3D मोशन क्रम।',
      clientPortalCta: 'क्लाइंट डैशबोर्ड में प्रवेश करें',
      motionToggle: 'कम गति (Motion)',
      replayLogo: 'लोगो एनिमेशन दोबारा देखें',
      skipIntro: 'छोड़ें (Skip)',
    },
  },

  de: {
    nav: {
      overview: 'Übersicht',
      portfolio: 'Portfolio',
      services: 'Kreativ-Dienste',
      help: 'Hilfecenter',
      editor: 'Editor',
      logout: 'Abmelden',
      profile: 'Kundenkonto',
      clientPortal: 'Pixel Media',
      phase2Badge: 'Phase 2',
    },
    overview: {
      welcome: 'Willkommen zurück',
      subtitle: 'Verfolgen Sie Ihre kreative Produktionspipeline, Assets und Lieferungen.',
      activeProjects: 'Aktive Projekte',
      inReview: 'In Prüfung',
      completed: 'Abgeschlossen',
      supportTickets: 'Support-Anfragen',
      quickActions: 'Schnellaktionen',
      requestService: 'Dienstleistung anfragen',
      requestServiceDesc: 'Starten Sie einen High-End-Video-, Audio- oder Grafikauftrag mit maßgeschneiderten Spezifikationen.',
      viewPortfolio: 'Portfolio durchsuchen',
      viewPortfolioDesc: 'Begutachten Sie kuratierte Arbeiten, Benchmarks und Fallstudien.',
      newTicket: 'Support-Ticket eröffnen',
      newTicketDesc: 'Erhalten Sie dedizierte Revisionen oder Fristunterstützung.',
      recentProjects: 'Produktions-Pipeline',
      allProjects: 'Alle Projekte',
      noProjectsTitle: 'Keine aktiven Projekte gefunden',
      noProjectsDesc: 'Sie haben derzeit keine Projekte in der Warteschlange. Starten Sie eine neue Service-Anfrage.',
      startFirstProject: 'Erstes Projekt beauftragen',
      status: 'Status',
      deadline: 'Frist',
      progress: 'Fortschritt',
    },
    statuses: {
      requested: 'Angefordert',
      in_progress: 'In Produktion',
      in_review: 'In Überprüfung',
      completed: 'Abgeschlossen',
      cancelled: 'Storniert',
      pending: 'Ausstehend',
      open: 'Offen',
      resolved: 'Gelöst',
      closed: 'Geschlossen',
    },
    categories: {
      all: 'Alle Kategorien',
      video_editing: 'Videoschnitt',
      image_editing: 'Bildretusche',
      audio_editing: 'Audioproduktion',
      esports_gaming: 'Esports & Gaming',
      graphic_design: 'Grafikdesign',
      motion_graphics: 'Motion Graphics',
    },
    portfolio: {
      title: 'Studio Showcase & Benchmarks',
      subtitle: 'Verifizierte kreative Vorführungen aus Broadcast-, Marken- und Esports-Produktionen.',
      filterAll: 'Alle Arbeiten',
      demoNote: 'Kuratierte Studio-Arbeiten — Demonstrationen für Kundenprüfungen.',
      scope: 'Projektumfang',
      deliverables: ['Finaler Master 4K', 'Social Crops (9:16, 1:1)', 'Projekt-Archiv'],
      client: 'Kunde',
      year: 'Jahr',
      viewProject: 'Projektdetails ansehen',
      closeModal: 'Schließen',
    },
    services: {
      title: 'Kreativ-Dienstleistungen & Postproduktion',
      subtitle: 'Wählen Sie aus unseren 6 spezialisierten Disziplinen für Ihre Medienprojekte.',
      turnaround: 'Standard-Bearbeitungszeit',
      deliverablesTitle: 'Enthaltene Lieferbestandteile',
      workflowTitle: 'Produktionsablauf',
      formatsTitle: 'Unterstützte Ausgabeformate',
      requestThisService: 'Diesen Dienst anfordern',
      requestModalTitle: 'Kreativanfrage aufgeben',
      formProjectTitle: 'Projekttitel / Kampagnenname',
      formProjectTitlePlaceholder: 'z.B. Q4 Marken-Spot oder Esports Highlight Pack',
      formCategory: 'Disziplin',
      formUrgency: 'Dringlichkeit',
      urgencyStandard: 'Standard (3-5 Tage)',
      urgencyExpress: 'Express (48 Stunden)',
      urgencyRush: 'Eilauftrag (24 Stunden)',
      formBudget: 'Budgetrahmen (optional)',
      formAssetsUrl: 'Cloud-Link zu Rohmaterialien (Drive / Dropbox)',
      formAssetsPlaceholder: 'https://drive.google.com/...',
      formTargetFormat: 'Zielformat / Spezifikationen',
      formFormatPlaceholder: 'z.B. 4K ProRes 422 + 1080x1920 MP4',
      formDescription: 'Kreatives Briefing & Anweisungen',
      formDescriptionPlaceholder: 'Beschreiben Sie Ihre visuelle Vision, Tonalität, Schnittstil...',
      submitting: 'Wird übermittelt...',
      submitRequest: 'Anfrage bestätigen & absenden',
      successMessage: 'Ihre Anfrage wurde erfolgreich übermittelt! Ihr Producer prüft sie umgehend.',
    },
    help: {
      title: 'Hilfecenter & Kundensupport',
      subtitle: 'Finden Sie Antworten zu Lieferfristen, Revisionen und Formaten.',
      faqTab: 'Häufig gestellte Fragen (FAQ)',
      contactTab: 'Direktanfrage stellen',
      myTicketsTab: 'Bisherige Anfragen',
      faqHeader: 'Studio Knowledge Base',
      faqSubheader: 'Antworten zu Workflows und Dateiverwaltung.',
      formSubject: 'Betreff',
      formCategory: 'Kategorie',
      formPriority: 'Priorität',
      formMessage: 'Detaillierte Nachricht',
      priorityLow: 'Niedrig',
      priorityNormal: 'Normal',
      priorityHigh: 'Hoch',
      priorityUrgent: 'Dringend',
      submitTicket: 'Anfrage absenden',
      ticketSuccess: 'Support-Ticket erfolgreich erstellt. Unser Team wurde benachrichtigt.',
      noTickets: 'Keine Support-Anfragen',
      noTicketsDesc: 'Sie haben bisher keine Anfragen eingereicht.',
    },
    editorPlaceholder: {
      badge: 'Phase 2 Architektur',
      title: 'Pixel Studio Web Suite',
      tagline: 'Leistungsstarker Cloud-Video- und Grafik-Editor in aktiver Entwicklung.',
      description: 'Phase 1 liefert das Kundenportal und die Projektverfolgung. Der interaktive Timeline-Editor ist für Phase 2 eingeplant.',
      backToDashboard: 'Zurück zum Kundenportal',
      phaseNotice: 'Diese Route ist für Phase 2 reserviert. Sämtliche Auftragsfunktionen sind im Portal aktiv.',
      feature1Title: 'Mehrspur-Timeline',
      feature1Desc: 'Framegenauer Schnitt, Audio-Mixing und Keyframe-Bezier-Kurven in WebGL.',
      feature2Title: 'Kunden-Feedback im Bild',
      feature2Desc: 'Timecode-genaue Annotationen synchronisiert in Echtzeit.',
      feature3Title: 'Hardwarebeschleunigung',
      feature3Desc: 'Latenzfreie Vorschau durch WebCodecs und GPU-Compositing.',
    },
    auth: {
      loginTitle: 'Bei Pixel Media anmelden',
      loginSubtitle: 'Greifen Sie auf Ihr persönliches Dashboard und Ihre Pipelines zu.',
      signupTitle: 'Kundenkonto erstellen',
      signupSubtitle: 'Erhalten Sie direkten Zugriff auf spezialisierte Medienproduktionen.',
      emailLabel: 'Geschäftliche E-Mail-Adresse',
      passwordLabel: 'Passwort',
      fullNameLabel: 'Vollständiger Name',
      companyLabel: 'Unternehmen / Organisation (optional)',
      loginButton: 'Im Portal anmelden',
      signupButton: 'Kundenkonto anlegen',
      googleButton: 'Mit Google OAuth fortfahren',
      noAccount: 'Noch kein Kundenkonto?',
      haveAccount: 'Bereits registriert?',
      signUpLink: 'Hier registrieren',
      logInLink: 'Hier anmelden',
      loggingIn: 'Authentifizierung läuft...',
      signingUp: 'Konto wird eingerichtet...',
      demoHint: '💡 Schnelltest: Geben Sie beliebige Zugangsdaten ein, um das Portal sofort zu testen.',
      passwordRequirements: 'Mindestens 6 Zeichen erforderlich.',
    },
    common: {
      language: 'Sprache',
      cancel: 'Abbrechen',
      close: 'Schließen',
      save: 'Speichern',
      loading: 'Lädt...',
      error: 'Ein unerwarteter Fehler ist aufgetreten.',
      success: 'Aktion erfolgreich ausgeführt.',
      required: 'Erforderlich',
      details: 'Details ansehen',
    },
    home: {
      heroBadge: '4K/8K Finishing • ACEScc Color • EBU R128 Gemastert',
      heroTitlePrefix: 'Postproduktion Entwickelt Für',
      heroTitleHighlight: 'Visionäre Kreative.',
      heroSubtitle: 'Das hochpräzise Postproduktionsstudio für Kinowerbung, High-End-Retusche, E-Sport-Highlights und 3D-Motion-Design.',
      launchTimeline: 'Timeline-Demo Starten',
      requestProject: 'Kreativprojekt Anfragen',
      explorePortfolio: 'Portfolio Erkunden',
      studioSpecs: 'Hardwarebeschleunigung // WebCodecs // 60fps Native Wiedergabe',
      statDisciplines: '6 Produktionsdisziplinen',
      statDelivery: '99,4% Pünktliche Lieferung',
      statMasters: 'ProRes 4444 & 16-Bit RAW',
      statPipeline: 'Aktive Produktionspipeline',
      timelineTitle: 'Interaktive Timeline-Engine',
      timelineSubtitle: 'Erleben Sie unsere professionelle Timeline-Demonstration. Abspielen, scrubben, Clips inspizieren und Timecodes verfolgen.',
      comparisonTitle: 'Präzisions-Grading & Retusche',
      comparisonSubtitle: 'Ziehen Sie den Split-Slider, um RAW-Sensordaten mit dem fertig gegradeten Pixel Media Master zu vergleichen.',
      servicesTitle: 'Kreativdienst-Explorer',
      servicesSubtitle: 'Untersuchen Sie unsere 6 Disziplinen mit Lieferspezifikationen, Bearbeitungszeiten und Produktionsphasen.',
      portfolioTitle: 'Cinematische Werkschau',
      portfolioSubtitle: 'Ausgewählte Kampagnen, redaktionelle Bildretusche, Turnierrecap-Videos und 3D-Sequenzen.',
      clientPortalCta: 'Zum Client-Dashboard',
      motionToggle: 'Reduzierte Bewegung',
      replayLogo: 'Intro Wiederholen',
      skipIntro: 'Intro Überspringen',
    },
  },

  fr: {
    nav: {
      overview: 'Aperçu',
      portfolio: 'Portfolio',
      services: 'Services de Montage',
      help: 'Centre d’Aide',
      editor: 'Éditeur',
      logout: 'Déconnexion',
      profile: 'Compte Client',
      clientPortal: 'Pixel Media',
      phase2Badge: 'Phase 2',
    },
    overview: {
      welcome: 'Bienvenue',
      subtitle: 'Suivez vos productions créatives, fichiers sources et livrables finaux.',
      activeProjects: 'Projets Actifs',
      inReview: 'En Révision',
      completed: 'Terminés',
      supportTickets: 'Demandes Actives',
      quickActions: 'Actions Rapides',
      requestService: 'Nouvelle Demande',
      requestServiceDesc: 'Lancez un projet de montage vidéo, retouche photo ou audio sur-mesure.',
      viewPortfolio: 'Voir le Portfolio',
      viewPortfolioDesc: 'Découvrez nos réalisations professionnelles et études de cas.',
      newTicket: 'Ouvrir un Ticket',
      newTicketDesc: 'Assistance dédiée, révisions urgentes ou questions administratives.',
      recentProjects: 'Pipeline de Production',
      allProjects: 'Tous les Projets',
      noProjectsTitle: 'Aucun projet actif',
      noProjectsDesc: 'Votre file d’attente est vide. Démarrez dès maintenant avec une commande de service.',
      startFirstProject: 'Commander un Premier Projet',
      status: 'Statut',
      deadline: 'Échéance',
      progress: 'Progression',
    },
    statuses: {
      requested: 'Demandé',
      in_progress: 'En Production',
      in_review: 'En Révision',
      completed: 'Terminé',
      cancelled: 'Annulé',
      pending: 'En Attente',
      open: 'Ouvert',
      resolved: 'Résolu',
      closed: 'Fermé',
    },
    categories: {
      all: 'Toutes les Catégories',
      video_editing: 'Montage Vidéo',
      image_editing: 'Retouche d’Image',
      audio_editing: 'Production Audio',
      esports_gaming: 'Esport & Gaming',
      graphic_design: 'Design Graphique',
      motion_graphics: 'Motion Design',
    },
    portfolio: {
      title: 'Showcase Studio & Références',
      subtitle: 'Réalisations créatives vérifiées pour la publicité, les marques et l’esport.',
      filterAll: 'Toutes les Réalisations',
      demoNote: 'Exemples de réalisations studio — démonstrations pour examen client.',
      scope: 'Périmètre du Projet',
      deliverables: ['Master Final 4K', 'Déclinaisons Réseaux (9:16, 1:1)', 'Archive Projet'],
      client: 'Client',
      year: 'Année',
      viewProject: 'Voir les Spécifications',
      closeModal: 'Fermer',
    },
    services: {
      title: 'Services Créatifs & Post-Production',
      subtitle: 'Choisissez parmi nos 6 expertises dédiées pour vos contenus audiovisuels.',
      turnaround: 'Délai de Livraison Standard',
      deliverablesTitle: 'Livrables Inclus',
      workflowTitle: 'Étapes de Production',
      formatsTitle: 'Formats Pris en Charge',
      requestThisService: 'Commander ce Service',
      requestModalTitle: 'Demande de Prestation Créative',
      formProjectTitle: 'Titre du Projet / Nom de Campagne',
      formProjectTitlePlaceholder: 'Ex: Spot Publicitaire Q4 ou Pack Best-Of Gaming',
      formCategory: 'Discipline Créative',
      formUrgency: 'Degré d’Urgence',
      urgencyStandard: 'Standard (3-5 Jours)',
      urgencyExpress: 'Express (48 Heures)',
      urgencyRush: 'Priorité Urgente (24 Heures)',
      formBudget: 'Fourchette Budgétaire (Optionnel)',
      formAssetsUrl: 'Lien Fichiers Sources (Drive / Dropbox)',
      formAssetsPlaceholder: 'https://drive.google.com/...',
      formTargetFormat: 'Formats et Résolutions Ciblés',
      formFormatPlaceholder: 'Ex: 4K ProRes 422 + 1080x1920 MP4 pour TikTok',
      formDescription: 'Brief Créatif & Consignes',
      formDescriptionPlaceholder: 'Détaillez vos intentions, le rythme souhaité, les références...',
      submitting: 'Envoi en cours...',
      submitRequest: 'Confirmer et Envoyer la Demande',
      successMessage: 'Votre demande a été enregistrée avec succès ! Notre équipe la traite sans délai.',
    },
    help: {
      title: 'Centre d’Aide & Support Client',
      subtitle: 'Réponses rapides sur les livrables, délais et cycles de révision.',
      faqTab: 'Foire Aux Questions (FAQ)',
      contactTab: 'Contacter le Support',
      myTicketsTab: 'Historique de mes Demandes',
      faqHeader: 'Base de Connaissances',
      faqSubheader: 'Consignes et réponses fréquentes sur nos flux de travail.',
      formSubject: 'Sujet du Message',
      formCategory: 'Catégorie',
      formPriority: 'Niveau de Priorité',
      formMessage: 'Message Détaillé',
      priorityLow: 'Faible',
      priorityNormal: 'Normal',
      priorityHigh: 'Élevé',
      priorityUrgent: 'Urgent',
      submitTicket: 'Envoyer la Demande',
      ticketSuccess: 'Ticket de support transmis avec succès.',
      noTickets: 'Aucune demande en cours',
      noTicketsDesc: 'Vous n’avez aucune demande de support. Contactez-nous en cas de besoin.',
    },
    editorPlaceholder: {
      badge: 'Architecture Phase 2',
      title: 'Suite Web Pixel Studio',
      tagline: 'Éditeur vidéo et graphique dans le cloud haute performance en cours de développement.',
      description: 'La Phase 1 fournit le portail client et le suivi de projet. L’éditeur interactif natif sur navigateur est prévu pour la Phase 2.',
      backToDashboard: 'Retourner au Tableau de Bord',
      phaseNotice: 'Cette route est réservée à la Phase 2. Toutes les commandes et demandes sont actives sur le portail.',
      feature1Title: 'Timeline Multi-Piste',
      feature1Desc: 'Découpe précise, mixage audio multipiste et courbes de Bézier en WebGL.',
      feature2Title: 'Annotations Collaboratives',
      feature2Desc: 'Dessins et commentaires synchronisés au timecode avec les monteurs.',
      feature3Title: 'Accélération Matérielle',
      feature3Desc: 'Prévisualisation fluide via WebCodecs et rendu GPU.',
    },
    auth: {
      loginTitle: 'Connexion à Pixel Media',
      loginSubtitle: 'Accédez à votre espace client privé et à vos productions.',
      signupTitle: 'Créer un Compte Client',
      signupSubtitle: 'Accédez immédiatement aux services créatifs et au suivi de production.',
      emailLabel: 'Adresse E-mail Professionnelle',
      passwordLabel: 'Mot de passe',
      fullNameLabel: 'Nom Complet',
      companyLabel: 'Entreprise / Organisation (Optionnel)',
      loginButton: 'Se Connecter au Portail',
      signupButton: 'Créer mon Compte Client',
      googleButton: 'Continuer avec Google OAuth',
      noAccount: 'Vous n’avez pas de compte client ?',
      haveAccount: 'Vous avez déjà un compte ?',
      signUpLink: 'Inscrivez-vous ici',
      logInLink: 'Connectez-vous ici',
      loggingIn: 'Authentification...',
      signingUp: 'Création du compte...',
      demoHint: '💡 Test Rapide : Saisissez n’importe quel email pour évaluer le portail sans attendre.',
      passwordRequirements: 'Minimum 6 caractères requis.',
    },
    common: {
      language: 'Langue',
      cancel: 'Annuler',
      close: 'Fermer',
      save: 'Enregistrer',
      loading: 'Chargement...',
      error: 'Une erreur inattendue est survenue.',
      success: 'Opération réussie.',
      required: 'Requis',
      details: 'Voir les Détails',
    },
    home: {
      heroBadge: 'Finishing 4K/8K • Étalonnage ACEScc • Master EBU R128',
      heroTitlePrefix: 'La Post-Production Conçue Pour Les',
      heroTitleHighlight: 'Créateurs Visionnaires.',
      heroSubtitle: 'Le studio créatif de haute précision pour films publicitaires, retouche beauté, temps forts esports et systèmes motion 3D.',
      launchTimeline: 'Lancer la Démo Timeline',
      requestProject: 'Demander un Projet',
      explorePortfolio: 'Explorer le Portfolio',
      studioSpecs: 'Accélération Matérielle // WebCodecs // Lecture Native 60fps',
      statDisciplines: '6 Disciplines de Production',
      statDelivery: '99.4% Respect des Délais',
      statMasters: 'ProRes 4444 & RAW 16-Bit',
      statPipeline: 'Pipeline de Production Actif',
      timelineTitle: 'Moteur de Timeline Interactif',
      timelineSubtitle: 'Découvrez notre démonstration de montage non-linéaire. Lisez, scratchez, inspectez les plans et le timecode en direct.',
      comparisonTitle: 'Étalonnage & Retouche de Précision',
      comparisonSubtitle: 'Glissez le séparateur pour comparer les rushs bruts et les masters finalisés par Pixel Media.',
      servicesTitle: 'Explorateur des Services Créatifs',
      servicesSubtitle: 'Inspectez nos 6 disciplines clés avec spécifications de livraison, délais d’exécution et étapes de travail.',
      portfolioTitle: 'Showcase Cinématographique',
      portfolioSubtitle: 'Sélection de campagnes publicitaires, retouches éditoriales, récapitulatifs esports et animations 3D.',
      clientPortalCta: 'Accéder au Portail Client',
      motionToggle: 'Mouvements Réduits',
      replayLogo: 'Rejouer l’Animation',
      skipIntro: 'Passer l’Intro',
    },
  },
};
