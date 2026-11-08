import os
import logging
import httpx
from typing import Optional, Dict, Any, List
from app.config import settings

logger = logging.getLogger("trait_advocate_pro.ai")

def is_ai_configured() -> bool:
    return bool(settings.GEMINI_API_KEY or settings.OPENAI_API_KEY)

def get_ai_status() -> Dict[str, Any]:
    active_provider = "none"
    if settings.GEMINI_API_KEY:
        active_provider = "Google Gemini (gemini-1.5-flash)"
    elif settings.OPENAI_API_KEY:
        active_provider = "OpenAI (gpt-4o-mini)"

    return {

        "openai_configured": bool(settings.OPENAI_API_KEY),
        "active_provider": active_provider,
        "mode": "live_ai" if is_ai_configured() else "rule_based_engine"
    }

async def call_live_ai(prompt: str, system_instruction: str = "") -> Optional[str]:
    """Attempts live AI call via Gemini or OpenAI if configured."""
    if settings.GEMINI_API_KEY:
        try:
            url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent"
            headers = {
    "x-goog-api-key": settings.GEMINI_API_KEY,
    "Content-Type": "application/json",
}
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": f"{system_instruction}\n\n{prompt}" if system_instruction else prompt}
                        ]
                    }
                ]
            }
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts:
                            return parts[0].get("text", "")
                else:
                    logger.warning(f"Gemini API returned status {res.status_code}: {res.text}")
        except Exception as e:
            logger.error(f"Gemini API exception: {str(e)}")

    if settings.OPENAI_API_KEY:
        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                "Content-Type": "application/json"
            }
            messages = []
            if system_instruction:
                messages.append({"role": "system", "content": system_instruction})
            messages.append({"role": "user", "content": prompt})
            
            payload = {
                "model": "gpt-4o-mini",
                "messages": messages,
                "temperature": 0.2
            }
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    choices = data.get("choices", [])
                    if choices:
                        return choices[0]["message"].get("content", "")
        except Exception:
            pass

    return None

async def generate_legal_assistant_response(
    query: str, 
    conversation_history: List[Dict[str, str]] = None,
    document_context: Optional[str] = None
) -> Dict[str, Any]:
    system_prompt = (
        "You are TRAIT Advocate Pro AI, an elite legal assistant specialized in Indian Jurisprudence, "
        "statutes (IPC/BNS, CrPC/BNSS, CPC, Indian Evidence Act/BSA, Constitution of India), court procedures, "
        "and legal documentation. Provide precise, professional, and practical legal guidance. "
        "Always recommend professional verification before court presentation."
    )
    
    prompt = query
    if document_context:
        prompt = f"DOCUMENT EXCERPTS:\n{document_context}\n\nUSER QUESTION:\n{query}\n\nPlease base your answer on the document excerpts provided above, citing references where applicable."

    live_response = await call_live_ai(prompt, system_prompt)
    if live_response:
        return {
            "content": live_response,
            "provider": "live_ai",
            "document_context_used": bool(document_context)
        }

    # Rule-based fallback legal assistant engine
    q_lower = query.lower()
    
    if document_context:
        ans = (
            f"### Document Analysis & Summary\n\n"
            f"Based on the extracted text from your selected document:\n\n"
            f"> **Contextual Match**:\n{document_context[:500]}...\n\n"
            f"**Key Observations**:\n"
            f"1. **Subject Matter**: The document relates directly to your query: '{query}'.\n"
            f"2. **Procedural Note**: Review dates, parties, and execution signatures indicated in the document.\n\n"
            f"*(Note: Running in offline/rule-based engine mode. Set `GEMINI_API_KEY` in environment for dynamic neural synthesis.)*"
        )
        return {"content": ans, "provider": "rule_based_engine", "document_context_used": True}

    if "bail" in q_lower:
        ans = (
            "### Legal Guidance on Bail Provisions (Indian Jurisprudence)\n\n"
            "Under Indian criminal law (CrPC / Bharatiya Nagarik Suraksha Sanhita, 2023):\n\n"
            "1. **Bailable Offences (Section 436 CrPC / Sec 478 BNSS)**:\n"
            "- Bail is a matter of right upon furnishing adequate surety.\n"
            "- Police officer or Court has no discretion to refuse if surety is furnished.\n\n"
            "2. **Non-Bailable Offences (Section 437/439 CrPC / Sec 480/483 BNSS)**:\n"
            "- Bail is a judicial discretion, determined by nature and gravity of accusation, risk of tampering with evidence, and flight risk.\n"
            "- **Anticipatory Bail (Sec 438 CrPC / Sec 482 BNSS)** is filed before the Sessions Court or High Court where there is reasonable apprehension of arrest in non-bailable offences.\n\n"
            "> **Statutory Notice**: Verified according to the statutory framework of India. Pleadings must be customized to specific charge sheets / FIR facts."
        )
    elif "138" in q_lower or "cheque" in q_lower:
        ans = (
            "### Cheque Dishonour — Section 138 Negotiable Instruments Act, 1881\n\n"
            "**Key Mandatory Timelines & Requirements**:\n"
            "1. **Presentation**: Cheque presented within validity period (3 months).\n"
            "2. **Return Memo**: Bank memo issued stating 'Funds Insufficient' or other dishonour reasons.\n"
            "3. **Statutory Legal Notice**: Must be issued within **30 days** of receiving bank return memo.\n"
            "4. **Cure Period**: 15 days provided to the drawer from receipt of notice to make payment.\n"
            "5. **Cause of Action**: If drawer fails to pay within 15 days, cause of action arises on the 16th day.\n"
            "6. **Filing Complaint**: Criminal complaint must be filed within **30 days** from the date cause of action arises before the Judicial Magistrate (JMFC/MM).\n\n"
            "> **Statutory Notice**: Strict adherence to limitation periods is necessary to avoid dismissal under Section 142(b) NI Act."
        )
    elif "limitation" in q_lower:
        ans = (
            "### Limitation Period Essentials (Limitation Act, 1963)\n\n"
            "- **Money Recovery / Debt Suits**: 3 years from the date debt became due (Article 19-21).\n"
            "- **Breach of Contract**: 3 years from the date the contract is broken.\n"
            "- **Specific Performance**: 3 years from date fixed for performance, or when plaintiff has notice that performance is refused (Article 54).\n"
            "- **Adverse Possession / Immovable Property**: 12 years (private property) / 30 years (government property).\n"
            "- **Condonation of Delay**: Section 5 allows condonation of delay in appeals and applications upon showing 'sufficient cause' (not applicable to original suits)."
        )
    else:
        ans = (
            f"### TRAIT Legal Analysis: {query}\n\n"
            f"**Legal Perspective (Indian Framework)**:\n"
            f"1. **Jurisdiction & Classification**: Verify whether the subject matter falls under Civil (CPC), Criminal (CrPC/BNSS), Commercial Courts Act, or Special Tribunals (NCLT, DRT, Consumer Forum).\n"
            f"2. **Cause of Action & Limitation**: Ensure cause of action is documented with precise dates, territorial nexus, and compliance with limitation laws.\n"
            f"3. **Evidence & Burden of Proof**: Establish standard of proof (preponderance of probabilities for civil, beyond reasonable doubt for criminal) under the Indian Evidence Act / Bharatiya Sakshya Adhiniyam.\n\n"
            f"> **System Note**: Operating in Rule-Based Legal Engine mode. For comprehensive AI-assisted responses across all statutes, configure `GEMINI_API_KEY` or `OPENAI_API_KEY`."
        )

    return {"content": ans, "provider": "rule_based_engine", "document_context_used": False}

async def generate_draft_content(req: Dict[str, Any]) -> str:
    draft_type = req.get("draft_type", "Legal Notice")
    title = req.get("title", draft_type)
    instructions = req.get("instructions", "")
    parties = req.get("parties", "")
    facts = req.get("facts", "")
    clauses = req.get("clauses_or_prayers", "")

    prompt = (
        f"Draft a formal, professional legal document of type: '{draft_type}'.\n"
        f"Title: {title}\n"
        f"Parties involved: {parties or 'Client / Opposing Party'}\n"
        f"Key Facts: {facts or instructions}\n"
        f"Specific Clauses/Prayers: {clauses or 'Standard legal remedies and interest'}\n"
        f"Additional Instructions: {instructions}\n\n"
        f"Please write a comprehensive, properly structured legal draft according to Indian legal format."
    )

    system_prompt = (
        "You are an expert Indian Legal Drafter. Format drafts using formal legal language, numbered paragraphs, "
        "proper headings (IN THE COURT OF... / LEGAL NOTICE / AFFIDAVIT), verified statements, and signature blocks."
    )

    live_result = await call_live_ai(prompt, system_prompt)
    if live_result:
        return live_result

    # High quality structured legal templates
    dtype = draft_type.lower()
    if "notice" in dtype:
        return (
            f"LEGAL NOTICE (REGISTERED A.D. / SPEED POST)\n"
            f"Ref: TRAIT/LN/{title.replace(' ', '_').upper()}\n\n"
            f"Date: [CURRENT_DATE]\n\n"
            f"TO:\n{parties or '[Name & Full Address of Opponent/Addressee]'}\n\n"
            f"FROM:\nAdvocate [Advocate Name], Bar Enrollment No: [XXXXX/YYYY]\n"
            f"Chambers: [Chamber/Firm Address]\n\n"
            f"SUB: LEGAL NOTICE FOR {title.upper()}\n\n"
            f"Under instructions from and on behalf of my client, [Client Name], having address at [Client Address] (hereinafter referred to as 'My Client'), I hereby serve upon you this Legal Notice:\n\n"
            f"1. That my Client is a law-abiding citizen/corporate entity carrying on bona fide business/operations.\n\n"
            f"2. That the relevant facts giving rise to this Notice are as follows:\n"
            f"   {facts or instructions or 'On the basis of agreed terms, transaction was entered into where you were obligated to perform specified commitments.'}\n\n"
            f"3. That despite repeated demands, communications, and reminders, you have deliberately and wilfully failed to comply with your lawful obligations.\n\n"
            f"4. That your failure constitutes a severe breach of legal duties and actionable wrong under applicable provisions of Indian law.\n\n"
            f"5. DEMAND:\n"
            f"   I hereby call upon you to comply with the following within FIFTEEN (15) DAYS from the date of receipt of this notice:\n"
            f"   (a) Make payment of the outstanding amount / perform the covenants specified herein;\n"
            f"   (b) Pay a sum of Rs. 10,000/- towards the cost of this legal notice.\n\n"
            f"PLEASE TAKE NOTICE that in the event of your failure to comply with the terms of this notice within the stipulated period, my Client has given me peremptory instructions to initiate appropriate civil suits and criminal proceedings against you in the competent Court of Law, entirely at your risk, cost, and consequences.\n\n"
            f"Yours faithfully,\n\n"
            f"_______________________\n"
            f"Advocate for the Client"
        )
    elif "affidavit" in dtype:
        return (
            f"BEFORE THE NOTARY PUBLIC / EXECUTIVE MAGISTRATE AT [CITY/DISTRICT]\n\n"
            f"AFFIDAVIT IN SUPPORT OF {title.upper()}\n\n"
            f"I, [Deponent Name], S/o [Father Name], aged about [Age] years, residing at [Full Address], do hereby solemnly affirm and declare on oath as under:\n\n"
            f"1. That I am the deponent herein and the {parties or 'Petitioner/Applicant'} in the present matter, and being fully conversant with the facts and circumstances of the case, am competent to swear this affidavit.\n\n"
            f"2. That the contents of the accompanying Application/Petition have been drafted under my instructions and the factual averments made therein are true and correct to the best of my personal knowledge.\n\n"
            f"3. {facts or instructions or 'That the circumstances warranting this urgent affidavit are bona fide and in the interest of justice.'}\n\n"
            f"4. That no previous application on the same cause of action has been filed or is pending adjudication before this or any other Court.\n\n"
            f"5. That the annexures attached herewith are true copies of their respective originals.\n\n"
            f"DEPONENT\n\n"
            f"VERIFICATION:\n"
            f"Verified at [City] on this [Day] day of [Month, Year], that the contents of paragraphs 1 to 5 of this affidavit are true and correct to the best of my knowledge and belief. No part of it is false and nothing material has been concealed therefrom.\n\n"
            f"DEPONENT\n"
            f"Solemnly affirmed and signed before me."
        )
    elif "agreement" in dtype:
        return (
            f"{title.upper()}\n\n"
            f"THIS AGREEMENT is entered into on this [Date] day of [Month, Year] by and between:\n\n"
            f"1. FIRST PARTY: [Party 1 Name], residing/registered at [Address] (hereinafter called 'First Party');\n"
            f"AND\n"
            f"2. SECOND PARTY: [Party 2 Name], residing/registered at [Address] (hereinafter called 'Second Party').\n\n"
            f"WHEREAS:\n"
            f"A. {facts or instructions or 'The Parties desire to enter into this Agreement to define their respective rights and responsibilities.'}\n\n"
            f"NOW, THEREFORE, IN CONSIDERATION OF MUTUAL PROMISES AND COVENANTS, THE PARTIES AGREE AS FOLLOWS:\n\n"
            f"1. SCOPE AND OBLIGATIONS: The Second Party shall perform services/deliver obligations as specified in Schedule A.\n\n"
            f"2. CONSIDERATION & PAYMENT TERMS: Payments shall be remitted in accordance with agreed milestones.\n\n"
            f"3. CONFIDENTIALITY: Neither party shall disclose proprietary information without prior written consent.\n\n"
            f"4. DISPUTE RESOLUTION & ARBITRATION: Any dispute arising out of this agreement shall be settled through arbitration under the Arbitration and Conciliation Act, 1996 in [City], India.\n\n"
            f"5. JURISDICTION: This agreement shall be governed by the laws of India and Courts at [City] shall have exclusive jurisdiction.\n\n"
            f"IN WITNESS WHEREOF, the parties hereto have signed this Agreement on the date first mentioned above.\n\n"
            f"FIRST PARTY: ____________________\n"
            f"SECOND PARTY: ____________________\n"
            f"WITNESS 1: ______________________\n"
            f"WITNESS 2: ______________________"
        )
    else:
        return (
            f"FORMAL LEGAL DRAFT: {title.upper()}\n\n"
            f"1. PARTIES / RECITALS:\n"
            f"{parties or 'By and between concerned parties'}\n\n"
            f"2. FACTUAL BACKGROUND:\n"
            f"{facts or instructions or 'Details and background statement as submitted.'}\n\n"
            f"3. GROUNDS & SUBMISSIONS:\n"
            f"{clauses or 'Grounds for seeking relief in the competent forum.'}\n\n"
            f"4. PRAYER / RELIEF SOUGHT:\n"
            f"Wherefore, in the facts and circumstances of the case, it is respectfully prayed that this Hon'ble Court / Authority may be pleased to grant the appropriate reliefs.\n\n"
            f"Date: [Date]\n"
            f"Place: [City]\n\n"
            f"ADVOCATE / APPLICANT"
        )

async def generate_legal_research(query: str, jurisdiction: str) -> Dict[str, Any]:
    prompt = (
        f"Conduct thorough legal research on the following query within the jurisdiction of '{jurisdiction}':\n"
        f"Query: {query}\n\n"
        f"Provide:\n"
        f"1. Statutory Framework and Governing Sections (e.g. BNS/IPC, BNSS/CrPC, CPC, Special Acts).\n"
        f"2. Core Legal Principles established by Courts.\n"
        f"3. Established Precedents and Supreme Court of India / High Court landmark principles.\n"
        f"4. Procedural Requirements & Limitation Periods.\n"
        f"5. Practical Advocate Recommendations.\n\n"
        f"IMPORTANT: Do not fabricate judgment citations or dates. Provide authoritative principles and indicate where advocate verification is mandatory."
    )

    system_prompt = (
        "You are an authoritative Indian Legal Research Scholar. Prioritize Indian jurisprudence, landmark Supreme Court "
        "rulings, and statutory provisions. Maintain strict adherence to legal accuracy."
    )

    live_res = await call_live_ai(prompt, system_prompt)
    if live_res:
        return {
            "response_content": live_res,
            "citations": "Live AI Synthesis from Indian Legal Authorities (Verification Required)"
        }

    # Structured Indian jurisprudence research engine
    q = query.lower()
    
    if "quash" in q or "482" in q:
        content = (
            f"### Legal Research: Inherent Powers to Quash Proceedings under Section 482 CrPC / Section 528 BNSS\n\n"
            f"**1. Governing Statutory Provisions**:\n"
            f"- **Section 482 of the Code of Criminal Procedure, 1973** (and corresponding Section 528 of Bharatiya Nagarik Suraksha Sanhita, 2023).\n"
            f"- Inherent powers of the High Court to prevent abuse of the process of any court and to secure the ends of justice.\n\n"
            f"**2. Landmark Principles Established by the Supreme Court of India**:\n"
            f"- *State of Haryana v. Bhajan Lal (1992 Supp (1) SCC 335)*: Formulated the landmark 7 illustrative guidelines for exercise of Section 482 powers.\n"
            f"- Proceedings can be quashed where allegations in the FIR, even if taken at their face value, do not prima facie constitute any offence.\n"
            f"- *State of Telangana v. Habib Abdullah Jeelani (2017)*: Reiterated that power must be exercised sparingly and with circumspection.\n\n"
            f"**3. Ground for Quashing Commercial/Matrimonial Disputes**:\n"
            f"- Commercial dispute maliciously converted into criminal proceedings (Section 420/406 IPC) warrants quashing (*Prof. R.K. Vijayasarathy v. Sudha Seetharam*).\n"
            f"- Settlement in disputes predominantly private or civil in character (*Gian Singh v. State of Punjab*).\n\n"
            f"**4. Practitioner Recommendation**:\n"
            f"- Verify complete FIR/Charge-sheet annexures.\n"
            f"- Ensure petition establishes absence of mens rea or demonstrable civil nature of dispute."
        )
        citations = "State of Haryana v. Bhajan Lal, 1992; Gian Singh v. State of Punjab, 2012; Sec 482 CrPC / Sec 528 BNSS"
    elif "arbitration" in q or "section 9" in q or "section 11" in q:
        content = (
            f"### Legal Research: Interim Relief & Appointment of Arbitrator under Arbitration Act, 1996\n\n"
            f"**1. Governing Framework**:\n"
            f"- **Arbitration and Conciliation Act, 1996** (as amended in 2015, 2019, 2021).\n"
            f"- **Section 9**: Interim measures by Court prior to arbitration, during proceedings, or after award but before enforcement.\n"
            f"- **Section 11**: Appointment of arbitrators by High Court / Supreme Court.\n\n"
            f"**2. Key Supreme Court Rulings**:\n"
            f"- *Vidya Drolia v. Durga Trading Corp. (2021 2 SCC 1)*: Established test for arbitrability ('four-fold test') and scope of referral under Section 11 is restricted to prima facie existence of agreement.\n"
            f"- *In Re: Interplay between Arbitration Agreements under the Arbitration Act and the Indian Stamp Act (2023 7-Judge Bench)*: Unstamped arbitration agreements do not render the agreement void ab initio at Section 11 stage.\n\n"
            f"**3. Practical Checklist**:\n"
            f"- Check mandatory Section 21 notice invoking arbitration.\n"
            f"- Confirm seat vs venue distinction in arbitration clause."
        )
        citations = "Vidya Drolia v. Durga Trading Corp. (2021); Re Interplay Stamp Act & Arbitration (2023 SC)"
    else:
        content = (
            f"### Legal Research Memorandum: {query}\n\n"
            f"**Jurisdiction**: {jurisdiction}\n\n"
            f"**1. Core Statutory Foundations**:\n"
            f"- Substantive Law: Relevant provisions of Indian Penal Code / Bharatiya Nyaya Sanhita (criminal), Indian Contract Act, 1872, Transfer of Property Act, 1882, or Companies Act, 2013.\n"
            f"- Procedural Law: Civil Procedure Code, 1908 or CrPC / BNSS, 2023.\n\n"
            f"**2. Fundamental Legal Test**:\n"
            f"- Locus standi: Petitioner/Plaintiff must show injury in fact or statutory right.\n"
            f"- Forum Competence: Territorial and pecuniary jurisdiction must be satisfied.\n"
            f"- Non-joinder / Misjoinder: All necessary parties must be arrayed.\n\n"
            f"**3. Evidentiary Standards**:\n"
            f"- Electronic records require certification under Section 65B of Indian Evidence Act / Section 63 of Bharatiya Sakshya Adhiniyam, 2023 (*Arjun Panditrao Khotkar v. Kailash Kushanrao Gorantyal*).\n\n"
            f"**4. Cautionary Legal Practice Notice**:\n"
            f"- All statutory citations and rulings must be cross-verified on official High Court / Supreme Court reporters (SCC / AIR) prior to pleading submission."
        )
        citations = "Standard Indian Judicial Reporters (SCC, AIR, SCR, DLT); Evidence Act / BSA 2023"

    return {
        "response_content": content,
        "citations": citations
    }
