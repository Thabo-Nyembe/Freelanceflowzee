# Data Processing Agreement (DPA)

**Between:**
- **Data Controller:** [Customer Name] ("Customer")
- **Data Processor:** KAZI Platform ("KAZI" or "Processor")

**Effective Date:** [Date of Customer Agreement]
**Version:** 1.0
**Last Updated:** December 11, 2025

---

## 1. Definitions

### 1.1 Key Terms

For the purposes of this Data Processing Agreement (DPA):

- **"GDPR"** means the General Data Protection Regulation (EU) 2016/679
- **"Personal Data"** means any information relating to an identified or identifiable natural person processed by KAZI on behalf of Customer
- **"Processing"** has the meaning given in Article 4(2) of the GDPR
- **"Data Subject"** means an identified or identifiable natural person whose Personal Data is processed
- **"Supervisory Authority"** means the data protection authority responsible in the Customer's jurisdiction
- **"Sub-processor"** means any third party appointed by KAZI to process Personal Data
- **"Data Breach"** means a breach of security leading to accidental or unlawful destruction, loss, alteration, unauthorized disclosure of, or access to Personal Data

---

## 2. Scope and Application

### 2.1 Scope of Agreement

This DPA applies to all processing of Personal Data by KAZI on behalf of Customer in connection with the provision of KAZI Platform services ("Services").

### 2.2 Relationship to Main Agreement

This DPA forms part of and is incorporated into the Terms of Service between Customer and KAZI. In the event of conflict, this DPA prevails regarding Personal Data protection.

### 2.3 Roles

- **Customer** acts as Data Controller (or Data Processor if processing on behalf of third parties)
- **KAZI** acts as Data Processor processing Personal Data on Customer's documented instructions

---

## 3. Processing Instructions

### 3.1 Documented Instructions

KAZI shall process Personal Data only on documented instructions from Customer, which include:

a) Use of the Services as described in the Terms of Service
b) Instructions through the Services interface (e.g., user actions, settings, configurations)
c) Written instructions provided by Customer via email or support channels
d) This DPA and its Annexes

### 3.2 Prohibited Processing

KAZI shall not:
- Process Personal Data for purposes other than those instructed by Customer
- Disclose Personal Data to third parties except as required by law or this DPA
- Transfer Personal Data outside the EEA without appropriate safeguards

### 3.3 Legal Requirements

If KAZI is required by EU or Member State law to process Personal Data beyond Customer's instructions, KAZI shall inform Customer of that legal requirement before processing (unless prohibited by law on important grounds of public interest).

---

## 4. Data Subject Rights

### 4.1 Assistance with Requests

KAZI shall, taking into account the nature of processing, assist Customer by implementing appropriate technical and organizational measures to fulfill Customer's obligation to respond to Data Subject requests, including:

- Right of access (Article 15 GDPR)
- Right to rectification (Article 16 GDPR)
- Right to erasure (Article 17 GDPR)
- Right to restriction of processing (Article 18 GDPR)
- Right to data portability (Article 20 GDPR)
- Right to object (Article 21 GDPR)
- Rights related to automated decision-making (Article 22 GDPR)

### 4.2 Data Subject Request Handling

**Platform Features:**
- Dashboard access for data viewing and editing
- Self-service data export functionality
- Account deletion option
- Privacy settings management

**KAZI Response Time:** Within 5 business days of Customer request

---

## 5. Security Measures

### 5.1 Technical and Organizational Measures

KAZI implements appropriate technical and organizational measures to ensure a level of security appropriate to the risk, including:

#### Technical Measures:
- ✅ Encryption of data in transit (TLS 1.3)
- ✅ Encryption of data at rest (AES-256)
- ✅ Pseudonymization where appropriate
- ✅ Access controls and authentication (RBAC)
- ✅ Regular security testing and vulnerability assessments
- ✅ Intrusion detection and prevention systems
- ✅ Security logging and monitoring
- ✅ Regular security updates and patch management

#### Organizational Measures:
- ✅ Security policies and procedures
- ✅ Staff training on data protection
- ✅ Background checks for personnel with data access
- ✅ Confidentiality agreements with staff
- ✅ Incident response procedures
- ✅ Business continuity and disaster recovery plans
- ✅ Vendor management program

### 5.2 Security Certification

KAZI maintains industry-standard security certifications and undergoes regular third-party security audits.

**Current Status:**
- Security measures documented
- Regular penetration testing
- Compliance audits conducted
- SOC 2 Type II ready

---

## 6. Sub-processing

### 6.1 Authorization

Customer authorizes KAZI to engage Sub-processors to process Personal Data, subject to the conditions in this Section.

### 6.2 Current Sub-processors

KAZI currently uses the following Sub-processors:

| Sub-processor | Service | Location | Purpose |
|---------------|---------|----------|---------|
| **Supabase (AWS)** | Database hosting | US (with EU option) | Data storage and management |
| **Vercel** | Application hosting | US/Global | Service delivery |
| **Stripe** | Payment processing | US/EU | Payment transactions |
| **OpenAI** | AI services | US | AI-powered features |
| **Upstash** | Cache/rate limiting | US/EU | Performance optimization |
| **Resend/SendGrid** | Email delivery | US | Transactional emails |
| **Wasabi** | Cloud storage | US (with EU option) | File storage |

**Full list available at:** https://kazi.com/subprocessors

### 6.3 Sub-processor Requirements

KAZI shall:
- Impose data protection obligations on Sub-processors equivalent to those in this DPA
- Remain fully liable to Customer for Sub-processor performance
- Conduct due diligence before engaging Sub-processors
- Execute written agreements with all Sub-processors

### 6.4 Sub-processor Changes

**Notification Process:**
- Customer will be notified of new or replacement Sub-processors at least 30 days in advance
- Notification via email to registered account email
- Customer may object to new Sub-processor within 30 days
- If Customer objects, parties will work in good faith to resolve concerns

**Objection Rights:**
If Customer objects and parties cannot resolve concerns, Customer may:
- Suspend use of the relevant Service
- Terminate the affected Service component
- Receive pro-rated refund for terminated services

---

## 7. International Data Transfers

### 7.1 Transfer Mechanisms

For transfers of Personal Data from the EEA to third countries, KAZI relies on:

1. **Standard Contractual Clauses (SCCs)**
   - EU Commission approved SCCs (2021 version)
   - Incorporated by reference in this DPA (Annex II)
   - Apply to all non-EEA Sub-processors

2. **Adequacy Decisions**
   - Where applicable under GDPR Article 45

3. **Data Localization**
   - EU customers may request EU-only processing
   - Available for Supabase (EU region) and Wasabi (EU region)

### 7.2 Transfer Impact Assessment

KAZI has conducted transfer impact assessments for all third-country transfers and implemented supplementary measures where necessary.

---

## 8. Data Breach Notification

### 8.1 Notification Obligation

KAZI shall notify Customer without undue delay upon becoming aware of a Personal Data breach affecting Customer's data.

**Notification Timeline:**
- Initial notification: Within 24 hours of discovery
- Detailed report: Within 72 hours

### 8.2 Breach Notification Content

Notifications shall include:
- Nature of the breach
- Categories and approximate number of Data Subjects affected
- Categories and approximate number of Personal Data records affected
- Likely consequences of the breach
- Measures taken or proposed to address the breach
- Contact point for more information
- Measures to mitigate possible adverse effects

### 8.3 Cooperation

KAZI shall cooperate with Customer and provide reasonable assistance regarding:
- Customer's obligation to notify Supervisory Authority (within 72 hours)
- Customer's obligation to notify affected Data Subjects (without undue delay)
- Customer's incident response and investigation

---

## 9. Data Protection Impact Assessment & Prior Consultation

### 9.1 Assistance with DPIA

Upon Customer request, KAZI shall provide reasonable assistance with Data Protection Impact Assessments (DPIA) required under Article 35 GDPR.

### 9.2 Information Provided

KAZI will provide:
- Description of processing operations
- Purpose of processing
- Assessment of necessity and proportionality
- Assessment of risks to Data Subject rights
- Security measures in place
- Sub-processor information

---

## 10. Deletion and Return of Data

### 10.1 Upon Termination

Upon termination of Services or upon Customer request, KAZI shall, at Customer's choice:

**Option A - Deletion:**
- Delete all Personal Data within 30 days
- Provide written confirmation of deletion
- Exception: Data required for legal/regulatory compliance

**Option B - Return:**
- Return all Personal Data in machine-readable format (JSON)
- Delete remaining copies after return
- Provide written confirmation

### 10.2 Retention for Legal Compliance

KAZI may retain Personal Data to the extent required by:
- EU or Member State law
- Legal proceedings or investigations
- Regulatory requirements

**Retention Period:** As required by law (e.g., 7 years for financial records)

### 10.3 Secure Deletion

Deletion includes:
- Production databases
- Backups (after retention period)
- Logs (anonymized or deleted)
- Sub-processor data (instructed to delete)

**Deletion Method:** Cryptographic erasure or secure overwrite per industry standards

---

## 11. Audit Rights

### 11.1 Customer Audit Rights

Customer (or third-party auditor) may audit KAZI's compliance with this DPA, subject to:

**Audit Frequency:**
- Once per 12-month period
- Additional audits if breach or regulatory requirement

**Audit Scope:**
- Processing activities covered by this DPA
- Security measures and controls
- Sub-processor management
- Compliance with documented instructions

**Audit Process:**
- 30 days advance written notice
- Mutually agreed audit plan
- Reasonable business hours
- Non-disclosure agreement required for auditors
- Customer bears audit costs

### 11.2 Alternative to On-site Audits

KAZI may, at its discretion, provide:
- Third-party security certifications (SOC 2, ISO 27001)
- Audit reports from independent auditors
- Completed security questionnaires
- Compliance documentation

---

## 12. Liability and Indemnification

### 12.1 Liability

Each party's liability under this DPA is subject to the limitation of liability provisions in the main Terms of Service.

### 12.2 GDPR-Specific Liability

Under Article 82 GDPR, each party is liable for damage caused by processing which infringes GDPR provisions, where it:
- Has not complied with GDPR obligations directed to processors
- Has acted outside lawful instructions of the Controller

### 12.3 Indemnification

KAZI shall indemnify Customer against:
- Fines imposed by Supervisory Authority due to KAZI's breach of this DPA
- Claims by Data Subjects due to KAZI's breach of this DPA
- Provided breach was due to KAZI's acts or omissions

**Exceptions:**
- Claims arising from Customer's instructions
- Customer's breach of GDPR obligations
- Customer's failure to implement recommended security measures

---

## 13. Term and Termination

### 13.1 Term

This DPA remains in effect for as long as KAZI processes Personal Data on behalf of Customer.

### 13.2 Termination

This DPA terminates automatically upon:
- Termination of the main service agreement
- Completion of data deletion/return obligations

### 13.3 Survival

The following provisions survive termination:
- Section 10 (Deletion and Return of Data)
- Section 12 (Liability and Indemnification)
- Section 14 (General Provisions)

---

## 14. General Provisions

### 14.1 Amendments

KAZI may amend this DPA to:
- Comply with changes in Data Protection Laws
- Reflect changes in processing operations
- Incorporate new security measures

**Notice:** 30 days advance notice of material changes

### 14.2 Governing Law

This DPA is governed by the laws of the jurisdiction specified in the main Terms of Service.

### 14.3 Conflict

In case of conflict between:
1. GDPR provisions (take precedence)
2. This DPA
3. Main Terms of Service

### 14.4 Severability

If any provision is held invalid, remaining provisions remain in effect.

### 14.5 Entire Agreement

This DPA, together with its Annexes and the main Terms of Service, constitutes the entire agreement regarding Personal Data processing.

---

## Annexes

### Annex I: Details of Processing

**A. List of Parties**
- Data exporter: Customer
- Data importer: KAZI Platform

**B. Description of Transfer**
- Categories of data subjects: Customer's end users, employees, contractors
- Categories of personal data: Account data, profile information, user content, usage data, payment information
- Sensitive data: None (optional: user may upload)
- Frequency of transfer: Continuous during service usage
- Nature of processing: Storage, hosting, AI processing, analytics, communication
- Purpose of processing: Provision of KAZI Platform services
- Retention period: Active account + 30 days (or as specified by Customer)

**C. Competent Supervisory Authority**
- Customer's data protection authority in jurisdiction of establishment

### Annex II: Technical and Organizational Measures

See Section 5.1 for detailed measures.

**Additional References:**
- GDPR Compliance Guide (docs/GDPR_COMPLIANCE_GUIDE.md)
- Security Documentation (docs/SECURITY_MEASURES.md)

### Annex III: List of Sub-processors

See Section 6.2 and https://kazi.com/subprocessors for current list.

### Annex IV: Standard Contractual Clauses

**SCCs Incorporated:** EU Commission Standard Contractual Clauses (Module 2: Controller to Processor) dated June 4, 2021.

**Full Text:** Available at https://commission.europa.eu/publications

---

## Acceptance

By using KAZI Platform services, Customer acknowledges and agrees to this Data Processing Agreement.

**For KAZI Platform:**
- Authorized Representative: [Name]
- Title: Data Protection Officer
- Date: [Effective Date]
- Contact: dpo@kazi.com

**For Customer:**
- Company Name: [Automatically filled from account]
- Acceptance Date: [Date of first service use]
- Contact: [Account email]

---

**Document Version:** 1.0
**Last Updated:** December 11, 2025
**Next Review:** March 2025

---

*For questions about this DPA, contact: legal@kazi.com or dpo@kazi.com*
