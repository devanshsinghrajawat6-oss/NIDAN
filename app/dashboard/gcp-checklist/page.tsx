"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, FileText, CheckCircle2, XCircle, AlertCircle, 
  Download, Building2, Calendar, UserCheck, Layers, Award, Save, RefreshCw 
} from "lucide-react";

interface ChecklistItem {
  section: string;
  itemNumber: string;
  description: string;
  status: 'Yes' | 'No' | 'NA';
  remark: string;
}

const GCP_SECTIONS = [
  {
    id: "I",
    title: "I. General Trial Details",
    description: "Trial site, inspection date, team composition, PI contact, Sponsor, NOC holder, EC, protocol version & investigational product details.",
    items: [
      { section: "I", itemNumber: "1", description: "Name and address of the clinical trial site verified and recorded." },
      { section: "I", itemNumber: "2", description: "Date of Inspection recorded." },
      { section: "I", itemNumber: "3", description: "Inspection Team Members listed with designation." },
      { section: "I", itemNumber: "4", description: "Personnel present during Inspection (with name and role/designation)." },
      { section: "I", itemNumber: "5", description: "Address & Contact details of Principal Investigator verified." },
      { section: "I", itemNumber: "6", description: "Name & address of the Sponsor recorded." },
      { section: "I", itemNumber: "7", description: "Name & address of clinical trial NOC holder verified." },
      { section: "I", itemNumber: "8", description: "Name & address of Institutional Ethics Committee (IEC)." },
      { section: "I", itemNumber: "9", description: "Approved Protocol Title verified." },
      { section: "I", itemNumber: "10", description: "Protocol Number, Version/date & Protocol amendments verified." },
      { section: "I", itemNumber: "11", description: "Investigational Product (IP) details & batch numbers logged." },
      { section: "I", itemNumber: "12", description: "Stage of study marked (Before Commencement / During Conduct / After Completion)." },
      { section: "I", itemNumber: "13", description: "Type of Inspection specified (Surveillance / For Cause)." }
    ]
  },
  {
    id: "II",
    title: "II. Legal & Administrative Aspects",
    description: "DCGI NOC, Ethics Committee approvals, financial agreements, liability, insurance, and SOP documentation.",
    items: [
      { section: "II", itemNumber: "1", description: "Clinical trial NOC from O/o DCGI available (along with Protocol no., Ver, date)." },
      { section: "II", itemNumber: "2", description: "NOC for subsequent protocol amendments, if any, from O/o DCGI obtained." },
      { section: "II", itemNumber: "3", description: "Ethics Committee approval date & letter verified (with Protocol no., Ver, date)." },
      { section: "II", itemNumber: "3.1", description: "Appendix VII as per Schedule Y (mention revision(s) and notification to O/o DCGI)." },
      { section: "II", itemNumber: "4", description: "Valid financial agreement between Sponsor, Investigator & Institution available." },
      { section: "II", itemNumber: "5", description: "Liability of involved parties (Investigator, Sponsor, Institution) clearly agreed." },
      { section: "II", itemNumber: "6", description: "Is valid clinical trial Insurance policy available and active?" },
      { section: "II", itemNumber: "7", description: "Site Initiation Date recorded." },
      { section: "II", itemNumber: "8", description: "Date of screening of first subject recorded." },
      { section: "II", itemNumber: "9", description: "Date of signing ICF by first subject recorded." },
      { section: "II", itemNumber: "10", description: "Date of Last Patient-Last Follow-Up (LPLFU) recorded (if applicable)." },
      { section: "II", itemNumber: "11", description: "Whether SOP for various trial activities are established and documented." },
      { section: "II", itemNumber: "12", description: "Verify whether hospital/institute/site has adequate emergency care facilities to handle emergency situations." }
    ]
  },
  {
    id: "III",
    title: "III. Organisation & Personnel",
    description: "CVs, qualifications, GCP & Schedule Y training certificates, duty delegation logs, and PI trial count limits.",
    items: [
      { section: "III", itemNumber: "1", description: "Assure signed & dated Curriculum Vitae is available for Investigator, Sub-Investigator & Co-Investigators." },
      { section: "III", itemNumber: "2", description: "Confirm educational qualification of Investigator with registration by Medical Council of State/India." },
      { section: "III", itemNumber: "3", description: "Confirm GCP, Schedule Y, NDCTR 2019, and protocol-specific training of Investigator & team." },
      { section: "III", itemNumber: "4", description: "Determine whether authority for trial activities was delegated properly by Investigator (duty delegation log)." },
      { section: "III", itemNumber: "5", description: "Check whether delegated personnel are adequately qualified and trained for assigned activities." },
      { section: "III", itemNumber: "6", description: "Obtain list of all clinical trials performed by Investigator (preferably last 3 years)." },
      { section: "III", itemNumber: "7", description: "Ensure Investigator is involved in conduct of not more than three clinical trials at a time." }
    ]
  },
  {
    id: "IV",
    title: "IV. Conduct of Trial & Screening",
    description: "Subject screening, inclusion/exclusion criteria review, clinical exams, labs, X-Ray/ECG/USG tests.",
    items: [
      { section: "IV", itemNumber: "1", description: "Check and review informed consent for screening of subjects." },
      { section: "IV", itemNumber: "2", description: "Check site screening log & enrolment log and obtain authenticated copy." },
      { section: "IV", itemNumber: "3", description: "Check whether subjects meet inclusion/exclusion criteria as per approved protocol w.r.t source documents & CRF." },
      { section: "IV", itemNumber: "3.1", description: "Clinical Examination by Investigator documented in patient files/source documents." },
      { section: "IV", itemNumber: "3.2", description: "Verify Clinical Laboratory Evaluation (Blood Cell Counts, LFT, KFT, Urine analysis required by protocol)." },
      { section: "IV", itemNumber: "3.3", description: "Verify X-Ray, MRI, ECG, USG or other diagnostic techniques required for criteria." },
      { section: "IV", itemNumber: "3.4", description: "Verify whether all conditions of Clinical Trial NOC are followed or not." }
    ]
  },
  {
    id: "IV-B",
    title: "IV-B. Informed Consent Process",
    description: "Schedule Y Appendix V elements, EC prior approval, signatures, impartial witness, and re-consenting rules.",
    items: [
      { section: "IV-B", itemNumber: "1", description: "Whether ICF has all elements enlisted in Appendix V of Schedule Y / NDCTR 2019." },
      { section: "IV-B", itemNumber: "1.1", description: "Whether ICF is approved by Ethics Committee prior to consent process." },
      { section: "IV-B", itemNumber: "2", description: "Whether IC has been obtained from each subject prior to participation in study." },
      { section: "IV-B", itemNumber: "3", description: "Whether signature/thumb impression of subject/legal representative affixed with date." },
      { section: "IV-B", itemNumber: "4", description: "Whether in case of illiterate subjects, signature & details of impartial witness are present." },
      { section: "IV-B", itemNumber: "5", description: "Have witness signature been personally dated (if applicable)?" },
      { section: "IV-B", itemNumber: "6", description: "Have patient/witness signature been personally dated?" },
      { section: "IV-B", itemNumber: "7", description: "Has dated signature of designated person administering IC been affixed?" },
      { section: "IV-B", itemNumber: "8", description: "Is designated person for administering IC medically qualified?" },
      { section: "IV-B", itemNumber: "9", description: "If IC administered by non-medically qualified person, evidence that medical queries answered by qualified person/PI?" },
      { section: "IV-B", itemNumber: "10", description: "Is completed ICF signed and dated by Principal Investigator?" },
      { section: "IV-B", itemNumber: "11", description: "Check whether re-consenting is done for changes in ICF, if any." }
    ]
  },
  {
    id: "IV-B1",
    title: "IV-B.1. Audio-Visual Recording (GSR 611(E))",
    description: "Mandatory AV recording of ICF for vulnerable populations, NCEs, HIV & Anti-Leprosy clinical trials.",
    items: [
      { section: "IV-B1", itemNumber: "1", description: "Whether Audio-Visual (AV) recording is performed for all subjects independently (or audio for HIV/Leprosy) per GSR 611(E)." },
      { section: "IV-B1", itemNumber: "2", description: "Is AV recording conducted in a room conducive to recording disturbance-free audio and video of consent process?" },
      { section: "IV-B1", itemNumber: "3", description: "Check whether video recording is free from disturbance to ensure image is recognizable and audio is clearly audible." },
      { section: "IV-B1", itemNumber: "4", description: "Check whether recording of informed consent process is preserved safely and securely." }
    ]
  },
  {
    id: "C",
    title: "V. Source Documents & CRF",
    description: "Source data legibility, dosage compliance, safety endpoints, Subject ID, CRF transcription, and SAE 24h/7d reporting.",
    items: [
      { section: "C", itemNumber: "1", description: "Verify condition, completeness, legibility, accessibility of investigator's source data file (charts, lab notes, diaries, etc.)." },
      { section: "C", itemNumber: "2", description: "Whether subject received test drug with respect to dose and frequency according to protocol." },
      { section: "C", itemNumber: "3", description: "Determine whether safety/efficacy endpoint data were collected and reported in accordance with protocol." },
      { section: "C", itemNumber: "4", description: "Does medical record mention Subject ID / name / hospital reg number and trial participation indication?" },
      { section: "C", itemNumber: "5", description: "Compare source document with CRF and determine whether source data have been correctly transcribed in CRF." },
      { section: "C", itemNumber: "6", description: "Verify drop-outs and reason for drop-out of subject is appropriately recorded." },
      { section: "C", itemNumber: "7", description: "Whether withdrawal of subject from study is recorded and appropriately justified per approved protocol." },
      { section: "C", itemNumber: "8", description: "Verify whether Standard Operating Procedure (SOP) of handling Serious Adverse Event (SAE) is available." },
      { section: "C", itemNumber: "9", description: "Verify whether all SAEs reported to Sponsor, EC and Licensing Authority within timelines (24h/7d per Schedule Y & GSR 53(E)/889(E))." },
      { section: "C", itemNumber: "10", description: "Verify whether SOP for medical care during serious adverse event is available." },
      { section: "C", itemNumber: "11", description: "Verify whether adequate medical care given to subject in event of illness, AEs, or abnormal lab parameters." },
      { section: "C", itemNumber: "12", description: "Verify whether all study related activities are performed at site approved by O/o DCGI." }
    ]
  },
  {
    id: "VI",
    title: "VI. Sponsor Responsibilities",
    description: "Sponsor report copies, CRF submission, dropout reporting, monitoring frequency, visit logs, and QA audit.",
    items: [
      { section: "VI", itemNumber: "1", description: "Whether investigator maintains copies of all reports submitted to the sponsor." },
      { section: "VI", itemNumber: "2", description: "Whether all CRFs were submitted to sponsor after completion of study." },
      { section: "VI", itemNumber: "3", description: "Determine whether all dropouts and reason thereof were reported to sponsor." },
      { section: "VI", itemNumber: "4", description: "Determine method and frequency of monitoring progress of study by sponsor and corrective action by site." },
      { section: "VI", itemNumber: "5", description: "Whether sponsor appointed a monitor with appropriate qualification and experience to monitor trial." },
      { section: "VI", itemNumber: "6", description: "Whether a log of onsite monitoring visit is maintained at the site." },
      { section: "VI", itemNumber: "7", description: "Is monitor submitting visit report with deviations, if any, to sponsor?" },
      { section: "VI", itemNumber: "8", description: "Whether sponsor performed QA audit independent and separate from routine monitoring." },
      { section: "VI", itemNumber: "9", description: "In case of premature termination/suspension, whether promptly informed to subjects, EC, and Licensing Authority." }
    ]
  },
  {
    id: "VII",
    title: "VII. Investigational Product (IP)",
    description: "Dose administration, drug reconciliation, leftover balance, storage conditions, security, and CT labeling.",
    items: [
      { section: "VII", itemNumber: "1", description: "Review individual subject records to verify correct dose administration (dose, frequency, route)." },
      { section: "VII", itemNumber: "2", description: "Determine whether unqualified/unauthorized persons administered or dispensed test drug." },
      { section: "VII", itemNumber: "3", description: "Determine whether adequate record of quantity received/dispensed is maintained & verify leftover drug balance." },
      { section: "VII", itemNumber: "4", description: "Determine whether storage condition & monitoring method are as per protocol recommendation." },
      { section: "VII", itemNumber: "5", description: "Whether trial medication is maintained in secured manner with controlled access." },
      { section: "VII", itemNumber: "6", description: "Have unused trial medications been returned to sponsor or disposed of according to protocol?" },
      { section: "VII", itemNumber: "7", description: "Are drug dispensing records being maintained properly?" },
      { section: "VII", itemNumber: "8", description: "Whether records for reconciliation of all IP's are maintained." },
      { section: "VII", itemNumber: "9", description: "Are electronic or hand-written temperature logs available for storage area of investigational products?" },
      { section: "VII", itemNumber: "10", description: "Verify that investigational product is appropriately labelled ('For clinical trial use only')." }
    ]
  },
  {
    id: "VIII",
    title: "VIII. Ethics Committee Compliance",
    description: "EC registration status (GSR 72(E)), approval letter, quorum of 5 satisfied, minutes, COI, and communication logs.",
    items: [
      { section: "VIII", itemNumber: "1", description: "Identify name and address of EC in approval letter and compare with Investigator Undertaking." },
      { section: "VIII", itemNumber: "2", description: "Verify Status of EC (Institutional/Independent) & check Registration certificate (per GSR 72(E) dated 08.12.2013)." },
      { section: "VIII", itemNumber: "2.1", description: "Verify EC approval letter mentions study code, title, version, docs reviewed, quorum of 5 satisfied, date/venue, signature." },
      { section: "VIII", itemNumber: "3", description: "Verify whether EC recorded minutes of meeting." },
      { section: "VIII", itemNumber: "4", description: "Verify whether EC performs on-site monitoring of clinical trial approved (frequency & SOP)." },
      { section: "VIII", itemNumber: "5", description: "Verify whether EC members abstained from voting in case of conflict of interest." },
      { section: "VIII", itemNumber: "6", description: "Verify communications between Investigator and EC are available for changes, SAEs, and protocol deviations." },
      { section: "VIII", itemNumber: "7", description: "Verify whether EC functions in accordance with conditions of registration by Licensing Authority." }
    ]
  },
  {
    id: "IX",
    title: "IX. Pathology Laboratory",
    description: "Clinical lab name/address, financial & confidentiality agreement, accreditation verification, and sample SOPs.",
    items: [
      { section: "IX", itemNumber: "1", description: "Name and address of clinical laboratory used in study recorded (Local and Outside)." },
      { section: "IX", itemNumber: "2", description: "Whether financial & confidentiality agreement with Investigator and concerned laboratory is in place." },
      { section: "IX", itemNumber: "3", description: "Is investigator/sponsor verified accreditation status and facility adequacy to perform specified tests?" },
      { section: "IX", itemNumber: "4", description: "Verify whether SOP for sample preparation, handling, and transportation is available and appropriate." }
    ]
  },
  {
    id: "X",
    title: "X. Quality Assurance & SOPs",
    description: "Site-specific & trial-specific SOPs, essential SOP components, operational SOPs, and staff training records.",
    items: [
      { section: "X", itemNumber: "1", description: "Verify whether SOP for all procedures conducted at site are available (Site Specific and Trial Specific SOPs)." },
      { section: "X", itemNumber: "2", description: "Verify essential components of SOP (prepared, checked, authorized, revision frequency)." },
      { section: "X", itemNumber: "3", description: "SOPs available for screening, ICF, AV recording of vulnerable pop/NCEs, SAE management, EC/Sponsor comms, training." },
      { section: "X", itemNumber: "4", description: "SOPs available for IP handling & distribution, blood sample collection, processing, preservation, local transport." },
      { section: "X", itemNumber: "5", description: "SOPs available for storage cabinets, refrigerators, and deep freezers used for samples & IP." },
      { section: "X", itemNumber: "6", description: "Verify records for job description/responsibilities, qualification, and training for all trial personnel maintained." },
      { section: "X", itemNumber: "7", description: "Verify whether activities performed are in compliance with duty delegated by Investigator." },
      { section: "X", itemNumber: "8", description: "Verify whether concerned staff is adequately trained and records maintained thereof." },
      { section: "X", itemNumber: "9", description: "In case of vaccines, is a spillage SOP available and study team trained to handle such an incidence?" }
    ]
  },
  {
    id: "XI",
    title: "XI. Record Keeping & Data Handling",
    description: "Document retention space & period, archival access control, data management SOP, correction initials, and electronic audit trail.",
    items: [
      { section: "XI", itemNumber: "1", description: "Is adequate space available for document retention?" },
      { section: "XI", itemNumber: "2", description: "Determine whether documents are maintained properly and for the period specified." },
      { section: "XI", itemNumber: "3", description: "Whether necessary measures taken to prevent accidental or premature destruction of trial records." },
      { section: "XI", itemNumber: "4", description: "Whether archival access is controlled or restricted to authorized personnel." },
      { section: "XI", itemNumber: "5", description: "Whether SOP available to document data management steps to allow step-by-step retrospective quality assessment." },
      { section: "XI", itemNumber: "6", description: "Whether corrections in documents carry date and initials of Investigators and authorized person." },
      { section: "XI-a", itemNumber: "1", description: "Is electronic data processing done by authorized person?" },
      { section: "XI-a", itemNumber: "2", description: "Verify whether list of authorized persons to make changes is maintained." },
      { section: "XI-a", itemNumber: "3", description: "Verify if provision for recording trail of changes and deletions (audit trail) is available." },
      { section: "XI-a", itemNumber: "4", description: "Whether hardware and software used for data recording and processing is validated." }
    ]
  }
];

export default function GcpChecklistPage() {
  const [trials, setTrials] = useState<any[]>([]);
  const [selectedTrial, setSelectedTrial] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("I");
  const [items, setItems] = useState<Record<string, { status: 'Yes' | 'No' | 'NA'; remark: string }>>({});
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/trials')
      .then(r => r.json())
      .then(j => {
        if (j.success && j.data.length > 0) {
          setTrials(j.data);
          setSelectedTrial(j.data[0].trialId);
        }
      });

    // Initialize all checklist items to Yes
    const initItems: Record<string, { status: 'Yes' | 'No' | 'NA'; remark: string }> = {};
    GCP_SECTIONS.forEach(sec => {
      sec.items.forEach(it => {
        const key = `${it.section}-${it.itemNumber}`;
        initItems[key] = { status: 'Yes', remark: 'Verified & Compliant' };
      });
    });
    setItems(initItems);
  }, []);

  const handleStatusChange = (key: string, status: 'Yes' | 'No' | 'NA') => {
    setItems(prev => ({
      ...prev,
      [key]: { ...prev[key], status }
    }));
  };

  const handleRemarkChange = (key: string, remark: string) => {
    setItems(prev => ({
      ...prev,
      [key]: { ...prev[key], remark }
    }));
  };

  // Calculate compliance score
  const totalEvaluated = Object.values(items).filter(i => i.status !== 'NA').length;
  const totalYes = Object.values(items).filter(i => i.status === 'Yes').length;
  const complianceScore = totalEvaluated > 0 ? Math.round((totalYes / totalEvaluated) * 100) : 100;

  const handleSaveAudit = async () => {
    setSaving(true);
    setSavedSuccess(false);

    const checklistItemsArray = Object.entries(items).map(([key, val]) => {
      const [sec, itemNo] = key.split('-');
      const secObj = GCP_SECTIONS.find(s => s.id === sec);
      const itemObj = secObj?.items.find(i => i.itemNumber === itemNo);
      return {
        section: sec,
        itemNumber: itemNo,
        description: itemObj?.description || '',
        status: val.status,
        remark: val.remark
      };
    });

    try {
      const res = await fetch('/api/gcp-checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trialId: selectedTrial,
          siteName: 'All India Institute of Ayurveda',
          checklistItems: checklistItemsArray
        })
      });
      const json = await res.json();
      if (json.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const currentSectionObj = GCP_SECTIONS.find(s => s.id === activeTab) || GCP_SECTIONS[0];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-300 dark:border-emerald-800">
              CDSCO / Schedule Y / NDCTR 2019
            </span>
          </div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5 mt-2">
            <ShieldCheck className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            GCP Inspection Checklist & Site Audit Hub
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Central Drugs Standard Control Organization (CDSCO) Inspection Audit Tool for Clinical Trial Sites & Investigators
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Download className="h-4 w-4" /> Print / Export Audit
          </button>
          <button
            onClick={handleSaveAudit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20 disabled:opacity-60"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Site Audit Log
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-700 dark:text-emerald-400 text-sm font-bold animate-fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          CDSCO GCP Site Audit Inspection record saved successfully to the system database & immutable audit log!
        </div>
      )}

      {/* Parallel Submission CDSCO Advisory Notice (Document 2) */}
      <div className="p-4 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 rounded-2xl flex items-start gap-3.5">
        <div className="p-2 bg-blue-600 text-white rounded-xl font-black text-xs shrink-0 mt-0.5">
          CDSCO ADVISORY
        </div>
        <div className="space-y-1 text-xs">
          <p className="font-extrabold text-blue-900 dark:text-blue-300">
            Parallel Submission Enabled (ETHICS-11011/5/2026-e-office / Rule 8, NDCTR 2019)
          </p>
          <p className="text-blue-700 dark:text-blue-400 leading-relaxed">
            Applicants may submit Clinical Trial protocols simultaneously to CDSCO and registered Ethics Committees without awaiting prior CLA approval. Registered ECs independently review protocols to reduce overall trial commencement timelines.
          </p>
        </div>
      </div>

      {/* Selector & Score Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="paper-card rounded-2xl p-5 shadow-sm">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Select Trial for Inspection</label>
          <select
            value={selectedTrial}
            onChange={e => setSelectedTrial(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none"
          >
            {trials.map(t => <option key={t._id} value={t.trialId}>{t.trialId} — {t.name}</option>)}
          </select>
        </div>

        <div className="paper-card rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Inspection Audit Score</p>
            <p className={`text-3xl font-black mt-1 ${complianceScore >= 85 ? 'text-emerald-600 dark:text-emerald-400' : complianceScore >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
              {complianceScore}%
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{totalYes} of {totalEvaluated} Checklist Items Satisfied</p>
          </div>
          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${complianceScore >= 85 ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600'}`}>
            <Award className="h-8 w-8" />
          </div>
        </div>

        <div className="paper-card rounded-2xl p-5 shadow-sm flex flex-col justify-center">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">CDSCO Inspection Status</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-3 py-1 text-xs font-black rounded-lg ${complianceScore >= 85 ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 text-amber-700'}`}>
              {complianceScore >= 85 ? 'PASS — GCP COMPLIANT SITE' : 'ACTION REQUIRED'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Rule 122DAB / Schedule Y ALCOA+ Standard</p>
        </div>
      </div>

      {/* Section Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {GCP_SECTIONS.map(sec => (
          <button
            key={sec.id}
            onClick={() => setActiveTab(sec.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
              activeTab === sec.id
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-[#0d1117] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {sec.title}
          </button>
        ))}
      </div>

      {/* Section Body */}
      <div className="paper-card rounded-2xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="font-heading text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-emerald-600" /> {currentSectionObj.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{currentSectionObj.description}</p>
        </div>

        <div className="space-y-4">
          {currentSectionObj.items.map(it => {
            const key = `${it.section}-${it.itemNumber}`;
            const itemState = items[key] || { status: 'Yes', remark: '' };

            return (
              <div key={key} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20 hover:border-slate-300 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="px-2 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold text-xs rounded-lg shrink-0 mt-0.5">
                      #{it.itemNumber}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{it.description}</p>
                    </div>
                  </div>

                  {/* Yes / No / NA Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    {(['Yes', 'No', 'NA'] as const).map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleStatusChange(key, st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors flex items-center gap-1 ${
                          itemState.status === st
                            ? st === 'Yes'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : st === 'No'
                              ? 'bg-red-600 text-white shadow-sm'
                              : 'bg-slate-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {st === 'Yes' && <CheckCircle2 className="h-3.5 w-3.5" />}
                        {st === 'No' && <XCircle className="h-3.5 w-3.5" />}
                        {st === 'NA' && <AlertCircle className="h-3.5 w-3.5" />}
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Remark Input */}
                <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
                  <input
                    type="text"
                    placeholder="Enter audit remark / observation / document reference..."
                    value={itemState.remark}
                    onChange={e => handleRemarkChange(key, e.target.value)}
                    className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500/50 text-slate-700 dark:text-slate-300"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
