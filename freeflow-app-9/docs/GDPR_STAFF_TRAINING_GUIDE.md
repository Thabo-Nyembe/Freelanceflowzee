# GDPR Staff Training Guide - KAZI Platform

**Training Program:** GDPR Awareness and Compliance
**Audience:** All KAZI Platform Staff
**Duration:** 2-3 hours (self-paced)
**Version:** 1.0
**Date:** December 12, 2025
**Status:** ✅ READY FOR DEPLOYMENT

---

## Training Objectives

By completing this training, staff will:
- ✅ Understand GDPR principles and requirements
- ✅ Recognize personal data and special category data
- ✅ Know how to handle data subject rights requests
- ✅ Understand data breach procedures
- ✅ Apply privacy by design principles
- ✅ Comply with KAZI's data protection policies

---

## Module 1: GDPR Fundamentals (30 minutes)

### What is GDPR?

**General Data Protection Regulation (GDPR)**
- EU regulation effective May 25, 2018
- Applies to all organizations processing EU residents' data
- Replaces Data Protection Directive 95/46/EC
- Enforceable with fines up to €20M or 4% global revenue

**Why It Matters:**
- Protects individual privacy rights
- Builds customer trust
- Avoids costly fines and reputational damage
- Legal requirement for EU operations

### Key Definitions

| Term | Definition | Example |
|------|------------|---------|
| **Personal Data** | Any information relating to an identified or identifiable person | Name, email, IP address, user ID |
| **Data Subject** | The person whose data is being processed | KAZI platform users |
| **Data Controller** | Entity that determines purposes and means of processing | KAZI Platform |
| **Data Processor** | Entity that processes data on behalf of controller | AWS (via Supabase), Vercel |
| **Processing** | Any operation on personal data | Collection, storage, deletion, transfer |
| **Special Category Data** | Sensitive personal data requiring extra protection | Health, race, religion, biometrics |

### GDPR Principles (Article 5)

1. **Lawfulness, Fairness, Transparency**
   - Process data legally and transparently
   - Tell users what we do with their data

2. **Purpose Limitation**
   - Collect data for specific purposes only
   - Don't use data for unrelated purposes

3. **Data Minimization**
   - Collect only necessary data
   - Don't ask for "nice to have" information

4. **Accuracy**
   - Keep data up-to-date and correct
   - Allow users to update their information

5. **Storage Limitation**
   - Don't keep data longer than necessary
   - Delete data when no longer needed

6. **Integrity and Confidentiality**
   - Keep data secure and confidential
   - Protect against unauthorized access

7. **Accountability**
   - Demonstrate compliance
   - Document our processes

**✅ Quiz Question 1:** Which GDPR principle says we should only collect necessary data?
- [ ] Purpose Limitation
- [x] Data Minimization
- [ ] Accuracy
- [ ] Storage Limitation

---

## Module 2: Lawful Basis for Processing (20 minutes)

### The 6 Lawful Bases (Article 6)

Processing must have at least one lawful basis:

| Basis | When to Use | KAZI Example |
|-------|-------------|--------------|
| **Consent** | User explicitly agrees | Marketing emails |
| **Contract** | Necessary to fulfill contract | Account management |
| **Legal Obligation** | Required by law | Tax records, payment history |
| **Vital Interests** | Protect life | Emergency medical data |
| **Public Task** | Official function | N/A (not government) |
| **Legitimate Interest** | Our interests, not overridden by user rights | Analytics, fraud prevention |

### KAZI's Lawful Bases

| Processing Activity | Lawful Basis | Documentation |
|---------------------|--------------|---------------|
| User registration | Contract | Terms of Service |
| Payment processing | Contract | Terms of Service |
| Email notifications | Consent | Cookie/Privacy preferences |
| Analytics | Legitimate Interest | Privacy Policy |
| Security monitoring | Legitimate Interest | Privacy Policy |
| Tax compliance | Legal Obligation | Legal requirements |

### Consent Requirements

**Valid consent must be:**
- ✅ Freely given (no coercion)
- ✅ Specific (clear purpose stated)
- ✅ Informed (user understands what they're agreeing to)
- ✅ Unambiguous (clear affirmative action required)
- ✅ Withdrawable (user can withdraw anytime)

**Invalid consent:**
- ❌ Pre-ticked boxes
- ❌ Bundled consent (all-or-nothing)
- ❌ Forced consent (access denied if declined)
- ❌ Unclear language

**✅ Quiz Question 2:** Can we use pre-ticked checkboxes for consent?
- [ ] Yes, for convenience
- [x] No, consent must be affirmative action
- [ ] Yes, if disclosed in Privacy Policy
- [ ] Only for non-essential cookies

---

## Module 3: Data Subject Rights (40 minutes)

### The 8 Data Subject Rights

#### 1. Right to Information (Articles 13-14)
**What:** Users must be informed about data processing
**How:** Privacy Policy, clear notifications
**Timeline:** At time of collection

**KAZI Implementation:**
- Privacy Policy published at `/privacy`
- Cookie Policy at `/cookie-policy`
- Terms of Service at `/terms`

#### 2. Right to Access (Article 15)
**What:** Users can request copy of their data
**How:** Dashboard → Settings → "Download My Data"
**Timeline:** Within 30 days (usually 24-48 hours)

**KAZI Implementation:**
- Self-service data export (JSON/CSV)
- Automated processing
- Comprehensive data package

**Staff Action:**
1. Verify user identity
2. Process export request
3. Provide data within timeline
4. Document request in system

#### 3. Right to Rectification (Article 16)
**What:** Users can correct inaccurate data
**How:** Dashboard → Profile → Edit
**Timeline:** Immediate (self-service)

**KAZI Implementation:**
- Users can edit profile anytime
- Changes reflected immediately
- Audit trail maintained

#### 4. Right to Erasure / "Right to be Forgotten" (Article 17)
**What:** Users can request data deletion
**How:** Dashboard → Settings → "Delete Account"
**Timeline:** Within 30 days (usually 24-48 hours)

**KAZI Implementation:**
- Self-service account deletion
- 30-day grace period before permanent deletion
- Some data retained for legal compliance (7 years for payment records)

**Exceptions:**
- Legal obligation (tax records)
- Legal claims (disputes)
- Public interest (research)

**Staff Action:**
1. Verify deletion request
2. Check if exceptions apply
3. Process within timeline
4. Confirm completion to user

#### 5. Right to Restriction (Article 18)
**What:** Users can limit how we process their data
**How:** Dashboard → Settings → "Suspend Account"
**Timeline:** Within 24 hours

**KAZI Implementation:**
- Account suspension available
- Data retained but not actively processed
- Can be reactivated anytime

#### 6. Right to Data Portability (Article 20)
**What:** Users can move their data to another service
**How:** Dashboard → Settings → "Export Data"
**Timeline:** Within 30 days

**KAZI Implementation:**
- Machine-readable formats (JSON, CSV)
- Comprehensive data export
- Easy import to competitors

#### 7. Right to Object (Article 21)
**What:** Users can object to processing
**How:** Dashboard → Settings → Privacy Preferences
**Timeline:** Immediate (for marketing)

**KAZI Implementation:**
- Marketing opt-out
- Analytics opt-out
- Cookie preferences

**Staff Action:**
1. Stop processing immediately
2. Update user preferences
3. Confirm to user

#### 8. Rights Related to Automated Decision-Making (Article 22)
**What:** Users can challenge automated decisions
**How:** N/A - KAZI doesn't make automated legal decisions
**Timeline:** N/A

**KAZI Note:** Our AI features are suggestions only, not automated decisions with legal effect.

### Handling Data Subject Requests

**Standard Procedure:**

1. **Receive Request**
   - Email: privacy@kazi.com
   - Dashboard: Self-service features
   - Written: Support ticket

2. **Verify Identity**
   - Account email confirmation
   - Additional verification for sensitive requests
   - Document verification process

3. **Assess Request**
   - Which right is being exercised?
   - Are there any exceptions?
   - Is it valid and complete?

4. **Process Request**
   - Take appropriate action
   - Document in system
   - Complete within timeline

5. **Respond to User**
   - Confirm completion
   - Provide requested data/confirmation
   - Explain any delays or denials

**Timelines:**
- Standard: 30 days
- Complex: Up to 60 days (with notice)
- Urgent (data breach): Immediately

**✅ Quiz Question 3:** What is the standard timeline for data subject access requests?
- [ ] 7 days
- [ ] 14 days
- [x] 30 days
- [ ] 90 days

---

## Module 4: Data Security (30 minutes)

### Security Measures at KAZI

#### Technical Measures

1. **Encryption**
   - ✅ TLS 1.3 for data in transit
   - ✅ AES-256 for data at rest
   - ✅ bcrypt (12 rounds) for passwords
   - ✅ E2E encryption for sensitive files

2. **Access Controls**
   - ✅ Role-Based Access Control (RBAC)
   - ✅ Multi-factor authentication
   - ✅ Principle of least privilege
   - ✅ Regular access reviews

3. **Monitoring**
   - ✅ 24/7 security monitoring
   - ✅ Audit logs for all data access
   - ✅ Anomaly detection
   - ✅ Regular security audits

4. **Backup**
   - ✅ Daily automated backups
   - ✅ Encrypted backup storage
   - ✅ Point-in-time recovery
   - ✅ Disaster recovery plan

### Staff Security Responsibilities

**DO:**
- ✅ Use strong, unique passwords
- ✅ Enable two-factor authentication
- ✅ Lock your workstation when away
- ✅ Report suspicious activity immediately
- ✅ Follow data handling procedures
- ✅ Encrypt sensitive data in email
- ✅ Use secure file transfer methods
- ✅ Keep software updated

**DON'T:**
- ❌ Share passwords or accounts
- ❌ Use personal email for work
- ❌ Download user data to personal devices
- ❌ Leave sensitive data visible on screen
- ❌ Click suspicious links
- ❌ Use public Wi-Fi without VPN
- ❌ Store passwords in plain text
- ❌ Ignore security alerts

### Data Handling Best Practices

**When Working with Personal Data:**

1. **Access Control**
   - Only access data you need for your job
   - Don't share credentials
   - Log out when finished

2. **Data Transfer**
   - Use encrypted channels only
   - Verify recipient before sending
   - No personal email for business data

3. **Data Storage**
   - Store only in approved systems
   - No local copies on personal devices
   - Delete temporary files

4. **Screen Privacy**
   - Lock screen when away
   - Position screen away from public view
   - Use privacy screens in public

5. **Disposal**
   - Delete data when no longer needed
   - Use secure deletion methods
   - Shred printed materials

**✅ Quiz Question 4:** What should you do if you receive a suspicious email asking for user data?
- [ ] Respond with the data if it looks official
- [ ] Forward to personal email for review
- [x] Report to security@kazi.com immediately
- [ ] Ignore it

---

## Module 5: Data Breach Response (25 minutes)

### What is a Data Breach?

**Definition:** Accidental or unlawful destruction, loss, alteration, unauthorized disclosure, or access to personal data.

**Examples:**
- Hacker gaining access to database
- Email sent to wrong recipient
- Lost/stolen laptop with user data
- Ransomware attack
- Accidental public exposure of data
- Employee accessing data without authorization

### Breach Severity Levels

| Level | Risk to Users | Examples |
|-------|--------------|----------|
| **Low** | Minimal/no risk | Encrypted data lost, quickly recovered |
| **Medium** | Some risk | Limited data exposure, low sensitivity |
| **High** | Significant risk | Financial data exposed, identity theft risk |
| **Critical** | Severe risk | Large-scale breach, special category data |

### GDPR Breach Obligations

**Article 33: Notify Supervisory Authority**
- Timeline: Within 72 hours of becoming aware
- Who: Data Protection Authority (DPA)
- Required: Description, impact, measures taken

**Article 34: Notify Data Subjects**
- When: If high risk to rights and freedoms
- Timeline: Without undue delay
- Required: Description, contact point, mitigation

### KAZI Breach Response Procedure

**IMMEDIATE (0-4 hours):**

1. **STOP** - Contain the breach
   - Isolate affected systems
   - Revoke compromised credentials
   - Block unauthorized access

2. **ASSESS** - Determine scope
   - What data was affected?
   - How many users?
   - How did it happen?

3. **DOCUMENT** - Record everything
   - Timeline of events
   - Actions taken
   - Who was notified

4. **NOTIFY** - Alert key people
   - Security team: security@kazi.com
   - Privacy lead: privacy@kazi.com
   - Management

**SHORT-TERM (4-24 hours):**

5. **INVESTIGATE** - Full analysis
   - Root cause analysis
   - Impact assessment
   - Risk evaluation

6. **REMEDIATE** - Fix the issue
   - Patch vulnerabilities
   - Enhance security measures
   - Prevent recurrence

**MEDIUM-TERM (24-72 hours):**

7. **REPORT** - Regulatory notification
   - Notify DPA if required (within 72 hours)
   - Provide full breach report
   - Ongoing updates if investigation continues

8. **COMMUNICATE** - User notification
   - Notify affected users if high risk
   - Provide clear guidance
   - Offer support (credit monitoring, etc.)

**LONG-TERM (72+ hours):**

9. **REVIEW** - Post-incident review
   - Lessons learned
   - Update procedures
   - Staff retraining if needed

10. **MONITOR** - Ongoing surveillance
    - Watch for misuse
    - Support affected users
    - Track remediation effectiveness

### Staff Responsibilities

**If you discover or suspect a breach:**

1. **REPORT IMMEDIATELY**
   - Email: security@kazi.com
   - Subject: "URGENT: Suspected Data Breach"
   - Include: What, when, who, how much data

2. **DO NOT:**
   - Try to fix it yourself (unless IT/security team)
   - Delete evidence
   - Notify users directly (wait for coordination)
   - Discuss publicly or on social media

3. **DO:**
   - Preserve evidence
   - Document what you know
   - Follow instructions from security team
   - Maintain confidentiality

**Remember:** Quick reporting is essential - we have only 72 hours to notify authorities!

**✅ Quiz Question 5:** How long do we have to notify the supervisory authority of a data breach?
- [ ] 24 hours
- [ ] 48 hours
- [x] 72 hours
- [ ] 7 days

---

## Module 6: Privacy by Design (20 minutes)

### What is Privacy by Design?

**Definition:** Embedding privacy into the design of systems, processes, and products from the start.

**GDPR Article 25 Requirements:**
- Privacy considerations from the outset
- Data protection by default
- Appropriate technical and organizational measures

### 7 Foundational Principles

1. **Proactive not Reactive**
   - Anticipate privacy risks
   - Prevent problems before they occur

2. **Privacy as Default**
   - Maximum privacy settings by default
   - Users opt-in to share more, not opt-out

3. **Privacy Embedded**
   - Core component, not add-on
   - Integrated into design

4. **Full Functionality**
   - Privacy AND functionality
   - Not a zero-sum game

5. **End-to-End Security**
   - Protect throughout lifecycle
   - Secure deletion when done

6. **Visibility and Transparency**
   - Open about practices
   - Users know what's happening

7. **User-Centric**
   - Respect user privacy
   - User control over their data

### KAZI Privacy by Design Examples

**Feature Design:**
- ✅ Dark mode by default (privacy-conscious)
- ✅ Encryption enabled automatically
- ✅ Minimal data required for signup
- ✅ Granular privacy controls
- ✅ One-click data export
- ✅ Self-service account deletion

**Development Practices:**
- ✅ Privacy review for new features
- ✅ Data minimization in forms
- ✅ Secure coding standards
- ✅ Regular security testing
- ✅ Privacy impact assessments

**Staff Actions:**
When designing/building features, ask:
1. Do we really need this data?
2. Can we use less data?
3. Can users control this?
4. Is this secure by default?
5. Can users understand this easily?

---

## Module 7: International Data Transfers (15 minutes)

### Why It Matters

GDPR restricts data transfers outside the EU/EEA to ensure continued protection.

### Transfer Mechanisms

| Mechanism | Description | KAZI Use |
|-----------|-------------|----------|
| **Adequacy Decision** | EU deems country has adequate protection | ✅ Using EU regions where possible |
| **Standard Contractual Clauses (SCCs)** | EU-approved contract terms | ✅ With all US sub-processors |
| **Binding Corporate Rules (BCRs)** | Internal privacy policies for multinationals | ❌ Not applicable |
| **Derogations** | Specific exemptions | ❌ Not relying on these |

### KAZI's Approach

**Primary Strategy:** EU Data Localization
- Supabase: EU regions (Frankfurt, London)
- Vercel: EU edge network
- Wasabi: EU storage (Amsterdam)
- Upstash: EU Redis (Frankfurt)

**US Transfers:** Standard Contractual Clauses
- All US sub-processors have SCCs in place
- Enhanced security measures (encryption)
- Transfer Impact Assessment completed
- EU alternatives identified

### Staff Responsibilities

**Before transferring data outside EU:**
1. Check if transfer is necessary
2. Verify appropriate safeguards exist
3. Use EU processors when available
4. Document transfer justification

**Don't:**
- Transfer data to non-approved countries
- Use non-approved cloud services
- Email personal data to non-EU staff without safeguards

---

## Module 8: Roles and Responsibilities (15 minutes)

### Organizational Structure

```
Data Protection Structure:
├── Data Controller: KAZI Platform
├── Data Protection Officer: [To be appointed]
├── Privacy Lead: [Role to be assigned]
└── All Staff: Compliance responsibility
```

### Role Responsibilities

**All Staff:**
- Follow GDPR policies
- Complete annual training
- Report breaches immediately
- Handle data securely
- Respect user privacy

**Developers:**
- Privacy by design in all features
- Secure coding practices
- Data minimization
- Security testing

**Support Team:**
- Handle data subject requests
- Verify user identity
- Respond within timelines
- Document all requests

**Management:**
- Allocate resources for compliance
- Foster privacy culture
- Review policies annually
- Approve privacy initiatives

**Privacy Lead / DPO (when appointed):**
- Monitor compliance
- Conduct audits
- Provide guidance
- Liaison with authorities

---

## Module 9: KAZI-Specific Policies (15 minutes)

### Data Retention Policy

| Data Type | Retention Period | Legal Basis |
|-----------|-----------------|-------------|
| Account data | Active + 30 days | Contract |
| Payment records | 7 years | Legal obligation |
| Communication logs | 3 years | Legitimate interest |
| Analytics data | 26 months | Consent |
| Support tickets | 3 years | Contract |
| Audit logs | 1 year | Legal obligation |
| Marketing lists | Until unsubscribe | Consent |

**Staff Action:**
- Don't keep data longer than necessary
- Delete data according to schedule
- Document retention decisions

### Sub-Processor Management

**Approved Sub-Processors:**
- Supabase (AWS) - Database
- Vercel - Hosting
- Stripe - Payments
- OpenAI - AI features
- Upstash - Cache/rate limiting
- Resend/SendGrid - Email
- Wasabi - Storage

**Before using new processor:**
1. Privacy review required
2. DPA must be signed
3. Security assessment needed
4. Document in sub-processor list

### Acceptable Use

**Permitted:**
- Access data needed for your role
- Use approved tools and systems
- Follow security procedures

**Prohibited:**
- Access user data out of curiosity
- Share data with unauthorized parties
- Use personal devices for sensitive data
- Download data without authorization
- Bypass security controls

**Consequences:**
- Policy violations may result in disciplinary action
- Serious breaches may result in termination
- Criminal violations reported to authorities

---

## Module 10: Practical Scenarios (10 minutes)

### Scenario 1: Access Request

**Situation:** User emails privacy@kazi.com: "I want all my data you have on me."

**Correct Response:**
1. ✅ Verify user identity via account email
2. ✅ Use self-service data export feature
3. ✅ Provide data within 30 days (or sooner)
4. ✅ Document request in system

**Incorrect Response:**
- ❌ Ignore the email
- ❌ Ask for excessive verification
- ❌ Charge a fee
- ❌ Take longer than 30 days without justification

### Scenario 2: Marketing Email

**Situation:** Marketing wants to email all users about new feature.

**Correct Approach:**
1. ✅ Only email users who consented to marketing
2. ✅ Include clear unsubscribe link
3. ✅ Respect previous unsubscribe requests
4. ✅ Document consent basis

**Incorrect Approach:**
- ❌ Email everyone "just once"
- ❌ Ignore unsubscribe requests
- ❌ Hide unsubscribe link
- ❌ Re-subscribe users who opted out

### Scenario 3: Data Breach

**Situation:** You accidentally email user database export to wrong recipient.

**Immediate Actions:**
1. ✅ Email security@kazi.com IMMEDIATELY
2. ✅ Attempt to recall email if possible
3. ✅ Document what happened
4. ✅ Do NOT try to cover it up

**What Security Team Will Do:**
- Assess severity (likely HIGH - database export)
- Contain breach (contact recipient, request deletion)
- Notify authorities within 72 hours
- Notify affected users
- Investigate and prevent recurrence

### Scenario 4: Deletion Request

**Situation:** User wants to delete account but has active subscription.

**Correct Response:**
1. ✅ Allow deletion (it's their right)
2. ✅ Cancel subscription per terms
3. ✅ Retain payment records for 7 years (legal obligation)
4. ✅ Delete all other data within 30 days
5. ✅ Confirm deletion to user

**Note:** Some data can be retained for legal obligations even after deletion request.

---

## Final Assessment

### Knowledge Check (Pass: 8/10 correct)

1. What does GDPR stand for?
   - [x] General Data Protection Regulation
   - [ ] Global Data Privacy Rights
   - [ ] General Digital Privacy Rules

2. Personal data includes:
   - [ ] Only names and addresses
   - [x] Any information relating to an identifiable person
   - [ ] Only financial information

3. Valid consent must be:
   - [ ] Implied from usage
   - [x] Freely given, specific, informed, and unambiguous
   - [ ] Assumed unless user objects

4. Users can request their data within:
   - [ ] 7 days
   - [x] 30 days
   - [ ] 90 days

5. We must notify authorities of a breach within:
   - [x] 72 hours
   - [ ] 7 days
   - [ ] 30 days

6. Which is NOT a data subject right?
   - [ ] Right to access
   - [ ] Right to erasure
   - [x] Right to free service

7. Passwords should be:
   - [x] Encrypted using bcrypt
   - [ ] Stored in plain text
   - [ ] Shared with team members

8. Privacy by design means:
   - [ ] Adding privacy features at the end
   - [x] Embedding privacy from the start
   - [ ] Only focusing on compliance

9. Data should be kept:
   - [ ] Forever for backup
   - [x] Only as long as necessary
   - [ ] Until user requests deletion

10. If you suspect a breach, you should:
    - [ ] Try to fix it yourself
    - [ ] Wait to see if it's serious
    - [x] Report immediately to security@kazi.com

**Answers:** 1-A, 2-B, 3-B, 4-B, 5-A, 6-C, 7-A, 8-B, 9-B, 10-C

---

## Training Completion

### Certificate of Completion

**I certify that I have:**
- ✅ Completed all 10 training modules
- ✅ Passed the final assessment (8/10 minimum)
- ✅ Understand GDPR requirements
- ✅ Will follow KAZI's privacy policies

**Staff Member:** _________________________

**Date:** _________________________

**Signature:** _________________________

### Next Steps

1. **Save Certificate:** File in personnel records
2. **Annual Refresh:** Retake training in 12 months
3. **Updates:** Complete additional training when policies change
4. **Questions:** Contact privacy@kazi.com

---

## Quick Reference Card

**Print and keep at desk:**

### Emergency Contacts
- **Security Breach:** security@kazi.com
- **Privacy Questions:** privacy@kazi.com
- **DPO (when appointed):** dpo@kazi.com

### Key Timelines
- **Access Request:** 30 days
- **Breach Notification:** 72 hours
- **Marketing Unsubscribe:** Immediate

### Remember
- ✅ Only collect necessary data
- ✅ Keep data secure
- ✅ Delete when no longer needed
- ✅ Report breaches immediately
- ✅ Respect user rights

### If in Doubt
**ASK! Better to ask than assume.**

---

**✅ TRAINING PROGRAM COMPLETE**

**Status:** Ready for staff deployment
**Format:** Self-paced online or instructor-led
**Duration:** 2-3 hours
**Frequency:** Annual (plus updates as needed)

---

*This training demonstrates KAZI's commitment to privacy compliance and staff awareness.*
