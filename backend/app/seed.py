from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import User, Client, Case, Document, Draft, ResearchRecord, Notification
from app.services.auth_service import get_password_hash

def seed_demo_data():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        email = "advocate.sharma@traitlaw.in"
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print("Demo user already exists.")
            return

        demo_user = User(
            email=email,
            hashed_password=get_password_hash("Advocate@2026"),
            full_name="Adv. Rajesh Sharma",
            bar_enrollment_number="D/1054/2014",
            phone="+91 98101 23456",
            law_firm="Sharma & Partners Chambers of Law",
            is_active=True
        )
        db.add(demo_user)
        db.flush()

        # Seed Clients
        c1 = Client(
            user_id=demo_user.id,
            full_name="Tata Consultancy Services Ltd.",
            email="legal.notices@tcs.com",
            phone="+91 22 6778 9999",
            address="TCS House, Raveline Street, Fort, Mumbai - 400001",
            notes="Corporate retainer client. Commercial arbitration and IPR matters."
        )
        c2 = Client(
            user_id=demo_user.id,
            full_name="Virendra Singh Oberoi",
            email="vs.oberoi@oberoihotels.net",
            phone="+91 98200 45678",
            address="14 Aurangzeb Road, New Delhi - 110011",
            notes="Property dispute and testamentary probate proceedings."
        )
        c3 = Client(
            user_id=demo_user.id,
            full_name="Apex Logistics & Supply Chain Pvt. Ltd.",
            email="directors@apexlogistics.in",
            phone="+91 11 4152 7700",
            address="Plot 55, Okhla Industrial Area Phase-III, New Delhi",
            notes="Recovery suit and Section 138 NI Act cheque dishonour proceedings."
        )
        db.add_all([c1, c2, c3])
        db.flush()

        # Seed Cases
        cs1 = Case(
            user_id=demo_user.id,
            client_id=c1.id,
            case_number="ARB.P. 312/2026",
            title="Tata Consultancy Services Ltd. vs. Union of India (Railways)",
            court_name="High Court of Delhi",
            case_type="Arbitration",
            status="Active",
            filing_date="2026-01-15",
            next_hearing_date="2026-11-20",
            description="Petition under Section 11(6) Arbitration & Conciliation Act for appointment of sole arbitrator for EPC contract dispute."
        )
        cs2 = Case(
            user_id=demo_user.id,
            client_id=c2.id,
            case_number="TEST.CAS. 45/2025",
            title="In the Matter of the Estate of Late Brig. K.S. Oberoi (Probate)",
            court_name="High Court of Delhi",
            case_type="Civil",
            status="Hearing Pending",
            filing_date="2025-08-12",
            next_hearing_date="2026-11-25",
            description="Probate petition under Section 276 of Indian Succession Act, 1925 regarding ancestral properties."
        )
        cs3 = Case(
            user_id=demo_user.id,
            client_id=c3.id,
            case_number="CC NO. 1890/2026",
            title="Apex Logistics Pvt. Ltd. vs. Global Cargo Express & Ors.",
            court_name="Patiala House District Courts, New Delhi",
            case_type="Criminal",
            status="Active",
            filing_date="2026-02-01",
            next_hearing_date="2026-12-02",
            description="Complaint under Section 138 Negotiable Instruments Act for dishonour of cheques worth Rs. 42 Lakhs."
        )
        db.add_all([cs1, cs2, cs3])
        db.flush()

        # Seed Drafts
        d1 = Draft(
            user_id=demo_user.id,
            case_id=cs3.id,
            client_id=c3.id,
            title="Statutory Legal Notice under Section 138 NI Act",
            draft_type="Legal Notice",
            content=(
                "REGISTERED A.D. / SPEED POST\n\n"
                "To,\n"
                "1. Global Cargo Express Private Limited\n"
                "   Through its Managing Director\n"
                "   Plot 88, Udyog Vihar Phase-IV, Gurugram, Haryana - 122016\n\n"
                "2. Mr. Vikramaditya Singhania, Managing Director\n"
                "   Global Cargo Express Private Limited\n\n"
                "SUBJECT: STATUTORY LEGAL NOTICE UNDER SECTION 138 READ WITH SECTION 141 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881 FOR DISHONOUR OF CHEQUE NO. 782014 DATED 10.01.2026 FOR RS. 42,00,000/-\n\n"
                "Under instructions from and on behalf of my client, M/s Apex Logistics & Supply Chain Pvt. Ltd. (hereinafter referred to as 'My Client'), I hereby serve upon you this Statutory Legal Notice:\n\n"
                "1. That my Client is a premier multimodal logistics provider having rendered inter-state freight transportation services to you under Service Agreement dated 14.04.2024.\n\n"
                "2. That in partial discharge of admitted and legally enforceable debt, you issued Cheque No. 782014 dated 10.01.2026 for a sum of Rs. 42,00,000/- drawn on Axis Bank, MG Road Branch, Gurugram.\n\n"
                "3. That upon presentation through My Client's banker, HDFC Bank, the said cheque was returned unpaid with memo dated 22.01.2026 citing 'FUNDS INSUFFICIENT'.\n\n"
                "4. DEMAND: I hereby call upon you to remit the said sum of Rs. 42,00,000/- along with interest @ 18% p.a. within FIFTEEN (15) DAYS from the date of receipt hereof, failing which criminal prosecution under Section 138 NI Act shall be initiated before the competent Judicial Magistrate.\n\n"
                "Rajesh Sharma\nAdvocate for the Complainant"
            ),
            prompt_used="Generate 138 notice for Rs 42 lakhs against Global Cargo",
            disclaimer_acknowledged=True
        )
        db.add(d1)

        # Seed Research
        r1 = ResearchRecord(
            user_id=demo_user.id,
            query="Inherent power of High Court under Section 482 CrPC / Section 528 BNSS to quash FIR arising out of commercial contract breach",
            jurisdiction="Supreme Court & Indian High Courts",
            response_content=(
                "### Landmark Ratio & Principles\n\n"
                "1. **Distinction between Civil Wrong and Criminal Offence**:\n"
                "The Hon'ble Supreme Court of India in *State of Haryana v. Bhajan Lal (1992 Supp (1) SCC 335)* and *Prof. R.K. Vijayasarathy v. Sudha Seetharam (2019 16 SCC 739)* held that where dispute is purely civil or contractual in nature and no fraudulent intention is shown at inception, criminal proceedings under Section 420/406 IPC (Sections 316/318 BNS) constitute an abuse of judicial process and must be quashed.\n\n"
                "2. **Four-Fold Test for Criminal Breach of Trust**:\n"
                "Mere failure to keep a commercial promise does not attract criminal liability unless fraudulent intention existed at the very time the inducement was made (*Vesa Holdings P. Ltd. v. State of Kerala, 2015*)."
            ),
            citations="Bhajan Lal, 1992; Prof. R.K. Vijayasarathy, 2019; Vesa Holdings, 2015",
            saved=True
        )
        db.add(r1)

        # Seed Notifications
        n1 = Notification(
            user_id=demo_user.id,
            title="Hearing Reminder: Delhi High Court",
            message="Hearing for 'TCS vs. Union of India' (ARB.P. 312/2026) listed on 20-Nov-2026 before Courtroom 24.",
            type="hearing_reminder",
            link="/cases"
        )
        n2 = Notification(
            user_id=demo_user.id,
            title="Legal Draft Ready",
            message="Notice under Section 138 NI Act compiled and ready for final advocate signature.",
            type="document_update",
            link="/drafting"
        )
        db.add_all([n1, n2])

        db.commit()
        print("Demo data seeded successfully.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo_data()
