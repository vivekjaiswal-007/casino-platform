import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const TERMS_DATA = [
  { num: '1', title: 'Introduction', content: 'The following terms and conditions apply to your use of this website (the "website") and its related or connected services (collectively, the "service"). You should carefully review these terms as they contain important information concerning your rights and obligations relating to your use of the website, whether as a guest or registered user with an account (an "account"). By accessing this website and using the service you agree to be bound by these terms together with any amendments which may be published from time to time by us. If you do not accept these terms, you must not access this website or use any part of it.' },
  { num: '2', title: 'General Terms', content: 'We reserve the right to revise and amend these terms of service at any time. You should visit this page periodically to review the terms and conditions. Any such changes will be binding and effective immediately upon publication on this website, unless you object to any such changes, in which case you must stop using our services. Your continued use of our website following such publication will indicate your agreement to be bound by the terms as amended. Any bets not settled prior to such changes taking effect will be subject to the pre-existing terms.' },
  { num: '3', title: 'Your Obligations', content: '3.1. You must be 18 years or older, or at least the legal age of majority in the jurisdiction where you live, to participate in any of our games.\n3.2. You are of legal capacity and can enter into a binding legal agreement with us.\n3.3. You are a resident in a jurisdiction that allows gambling.\n3.4. You may not use a VPN, proxy or similar services.\n3.5. You are the authorized user of the payment method you use.\n3.6. You must make all payments in good faith.\n3.7. When placing bets you may lose some or all of your money.\n3.8. You must not use any information obtained in breach of any legislation.\n3.9. You are not acting on behalf of another party or for any commercial purposes.\n3.10. You must not attempt to manipulate any market or element within the service.\n3.11. You must generally act in good faith in relation to the service at all times.\n3.12. You or your employees/family members are not registered as an affiliate in our affiliate program.' },
  { num: '4', title: 'Restricted Use', content: '4.1. You must not use the service if you are under 18 years, reside in a restricted country (USA, France, Netherlands, Australia, UK, Spain, Cyprus), or engage in any prohibited activities including fraud, data scraping, or account manipulation.\n4.2. You cannot sell or transfer your account to third parties.\n4.3. You may not transfer funds between player accounts.\n4.4. We may immediately terminate your account for unauthorized use.\n4.5. Employees of the company are not allowed to use the service for real money without prior consent.\n4.6. Only one bonus is allowed per customer, family, address, or shared IP.' },
  { num: '5', title: 'Registration', content: '5.1. We reserve the right to refuse any registration application at our sole discretion.\n5.2. You must personally complete the registration form and accept these terms.\n5.3. You must provide accurate contact information including a valid email address.\n5.4. You are only allowed to register one account with the service.\n5.5. We may ask for additional personal information to confirm your identity.\n5.6. You must keep your password confidential and change it regularly.\n5.7. You must not transmit any screen captures of service content to third parties.\n5.8. All currencies available on the website may be used for deposits and withdrawals.' },
  { num: '6', title: 'Your Account', content: '6.1. Accounts may use several currencies; all balances appear in the currency used for the transaction.\n6.2. We do not give credit for the use of the service.\n6.3. We may close or suspend an account if you are not complying with these terms.\n6.4. We reserve the right to close or suspend any account without prior notice and return all funds.\n6.5. We reserve the right to refuse, restrict, cancel or limit any wager at any time.\n6.6. Any amount mistakenly credited to your account remains our property.\n6.7. If your account goes overdrawn, you shall be in debt to us for the amount overdrawn.\n6.8. You must inform us as soon as you become aware of any errors with respect to your account.\n6.9. We offer a self-exclusion option for players who feel they have lost control of their gambling.' },
  { num: '7', title: 'Deposit of Funds', content: '7.1. All deposits should be made from an account or payment method registered in your own name.\n7.2. Fees and charges may apply to deposits and withdrawals.\n7.3. We use third party electronic payment processors for credit and debit card deposits.\n7.4. You agree to fully pay all payments and charges due to us or payment providers.\n7.5. If you accept any promotional or bonus offer, you agree to the terms of that bonus.\n7.6. Funds originating from criminal or illegal activities must not be deposited with us.\n7.7. It is recommended that you retain a copy of transaction records.\n7.8. Internet gambling may be illegal in the jurisdiction where you are located; it is your responsibility to check.' },
  { num: '8', title: 'Withdrawal of Funds', content: '8.1. Minimum withdrawal amount per transaction is INR 1000 (or equivalent).\n8.2. No withdrawal commissions if you roll over the deposit at least 1 time. Otherwise a 10% fee applies (minimum INR 400).\n8.3. We reserve the right to request photo ID and address confirmation before granting withdrawals.\n8.4. All withdrawals must be made to the original payment method used for deposit.\n8.5. Contact customer service if your account is inaccessible and you wish to withdraw.\n8.6. Maximum withdrawal per month: INR 5,00,000 (if balance is 10x deposits) or INR 10,00,000 otherwise.' },
  { num: '9', title: 'Payment Transactions', content: '9.1. You are fully responsible for paying all monies owed to us. Any charge-backs will be recharged with an INR 5000 administration fee.\n9.2. We reserve the right to use third party electronic payment processors.\n9.3. All transactions may be checked to prevent money laundering or terrorism financing. Suspicious transactions will be reported to the relevant authority.' },
  { num: '10', title: 'Errors', content: '10.1. In the event of an error or malfunction of our system or processes, all bets are rendered void.\n10.2. If a bet is accepted at an incorrect odd, we reserve the right to cancel or void that wager.\n10.3. We have the right to recover from you any amount overpaid and to adjust your account to rectify any mistake.' },
  { num: '11', title: 'Rules of Play, Refunds & Cancellations', content: '11.1. The winner of an event will be determined on the date of the event\'s settlement.\n11.2. All results posted shall be final after 72 hours.\n11.3. If a match result is overturned by the governing body within the payout period, all money will be refunded.\n11.4. Draw rules apply per event type.\n11.5. If a result cannot be validated, wagers on that event will be refunded.\n11.6. Minimum and maximum wager amounts are subject to change without prior notice.\n11.7. Customers are solely responsible for their own account transactions.' },
  { num: '12', title: 'Communications & Notices', content: '12.1. All communications to us shall be sent using the customer support form on the website.\n12.2. All communications from us shall be posted on the website or sent to your registered email address.\n12.3. All communications shall be in writing in the English language.\n12.4. We may contact you by email for promotional offerings. You may opt out at any time.' },
  { num: '13', title: 'Matters Beyond Our Control', content: 'We cannot be held liable for any failure or delay in providing the service due to an event of force majeure including Acts of God, trade disputes, power cuts, government actions, or telecommunication failures.' },
  { num: '14', title: 'Liability', content: '14.1. To the extent permitted by applicable law, we will not compensate you for reasonably foreseeable losses if we fail to carry out our obligations due to your own fault, third party issues, or unforeseeable events.\n14.2. Our total aggregate liability shall not exceed the value of the bets you placed or EUR €500, whichever is lower.\n14.3. We strongly recommend you verify compatibility of the service with your equipment and install anti-virus software.' },
  { num: '15', title: 'Gambling By Those Under Age', content: '15.1. If we suspect you are under 18 years, your account will be suspended immediately. All winnings will be retained and any non-winning deposits may be returned at our discretion.\n15.2. This also applies if you are over 18 but betting in a jurisdiction that specifies a higher legal age.\n15.3. We reserve the right to inform relevant law enforcement agencies in cases of suspected underage gambling.' },
  { num: '16', title: 'Fraud', content: 'We will seek criminal and contractual sanctions against any customer involved in fraud, dishonesty or criminal acts. We will withhold payment to any customer where any of these are suspected.' },
  { num: '17', title: 'Intellectual Property', content: '17.1. Any unauthorized use of our name and logo may result in legal action.\n17.2. We are the sole owners of the rights to the service, technology, software and odds.\n17.3. You may not use our trademarks or logos in connection with any other product or service.\n17.4. We and our licensors do not grant you any rights beyond those stated in these terms.' },
  { num: '18', title: 'Your License', content: '18.1. We grant you a non-exclusive, limited, non-transferable license to access and use the service for personal non-commercial purposes only.\n18.2. You may not modify, publish, transmit, sell, or reproduce any content from the service.\n18.3. Any non-compliance may result in civil liability or criminal prosecution.' },
  { num: '19', title: 'Your Conduct & Safety', content: '19.1. Posting any content that is unlawful, inappropriate or undesirable is strictly prohibited.\n19.2. Prohibited behavior will result in immediate account termination without notice.\n19.3. Prohibited behavior includes fraud, spreading viruses, reverse engineering, using bots, spamming, impersonation, and any activity contrary to our business principles.' },
  { num: '20', title: 'Links To Other Websites', content: 'The service may contain links to third party websites. We have no control over and take no responsibility for the content or availability of linked websites.' },
  { num: '21', title: 'Complaints', content: '21.1. Concerns should be directed to our customer service department via the website.\n21.2. We take no liability when responding to complaints.\n21.3. Bet settlement queries will be responded to within 28 days of receipt.\n21.4. Disputes must be lodged within 3 days from the date the wager was decided.\n21.5. Unresolved disputes will be escalated to our management.\n21.6. Unresolved complaints may be lodged with our licensing body Gaming Services Provider N.V.' },
  { num: '22', title: 'Assignment', content: 'You may not assign any rights or obligations under these terms without our prior written consent. We may assign our rights and obligations to any third party capable of providing a substantially similar service.' },
  { num: '23', title: 'Severability', content: 'If any provision of these terms is deemed unenforceable, it shall be modified to allow enforcement in line with the original intent. The remaining provisions shall not be affected.' },
  { num: '24', title: 'Breach of These Terms', content: 'We may suspend or terminate your account and refuse to continue providing the service if you breach any material term of these terms, without prior notice.' },
  { num: '25', title: 'General Provisions', content: '25.1. These terms remain in full force while you access or use the service.\n25.2. Gender-neutral language applies throughout.\n25.3. Our failure to enforce any term at any time shall not constitute a waiver.\n25.4. By using the service, you acknowledge having read and agreed to each paragraph of these terms.\n25.5. In case of discrepancy, the English language version prevails.\n25.6. These terms are governed by the law in force in Curaçao.\n25.7. These terms constitute the entire agreement between you and us with respect to the service.' },
  { num: '26', title: 'Casino Payout Restrictions', content: '26.1. Restriction of payout is applicable for all Casino games.\n26.2. In a single round, a user is eligible for a max payout of 100 times their bet amount (e.g., bet ₹100 = max payout ₹10,000).\n26.3. Maximum payout is capped at ₹2,00,00,000 (2 Crore points). Any winning above this amount will be limited to this cap.\n\nNOTE: Players using VPN or logging in from different IPs frequently may result in voided bets. Accounts may be suspended based on different IPs from multiple cities.' },
]

export default function Terms() {
  const [open, setOpen] = useState(null)

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <img src="https://res.cloudinary.com/dnzfce2wa/image/upload/v1778083251/download_ehcf4o.png" alt="Logo" style={{ height: '50px', marginBottom: '12px' }} />
        <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(20px,4vw,28px)', color: '#c9a227', marginBottom: '8px' }}>Terms & Conditions</h1>
        <p style={{ color: '#555', fontSize: '12px' }}>New Mahadev Gaming • Last updated: January 2024</p>
      </div>

      {/* Intro box */}
      <div style={{ background: 'rgba(201,162,39,0.06)', border: '1px solid rgba(201,162,39,0.2)', borderRadius: '12px', padding: '18px 22px', marginBottom: '24px' }}>
        <p style={{ color: '#888', fontSize: '13px', lineHeight: '1.8' }}>
          Welcome to New Mahadev Gaming. These Terms and Conditions govern your use of our platform and services. Please read them carefully. By accessing this website you agree to be bound by these terms.
        </p>
      </div>

      {/* Accordion sections */}
      {TERMS_DATA.map((s) => (
        <div key={s.num} style={{ marginBottom: '8px', background: '#0e0e18', borderRadius: '10px', overflow: 'hidden' }}>
          <button
            onClick={() => setOpen(open === s.num ? null : s.num)}
            style={{ width: '100%', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <span style={{ fontSize: '14px', fontWeight: '700', color: open === s.num ? '#c9a227' : '#ccc' }}>
              {s.num}. {s.title}
            </span>
            <span style={{ color: '#555', fontSize: '18px' }}>{open === s.num ? '−' : '+'}</span>
          </button>
          {open === s.num && (
            <div style={{ padding: '0 20px 18px', borderTop: '1px solid #1a1a2a' }}>
              <p style={{ color: '#777', fontSize: '13px', lineHeight: '1.9', marginTop: '14px', whiteSpace: 'pre-line' }}>{s.content}</p>
            </div>
          )}
        </div>
      ))}

      {/* Contact */}
      <div style={{ background: '#0e0e18', borderRadius: '12px', padding: '24px', textAlign: 'center', marginTop: '28px' }}>
        <p style={{ color: '#666', fontSize: '13px', marginBottom: '8px' }}>Questions about these terms?</p>
        <p style={{ color: '#c9a227', fontSize: '13px', fontWeight: '700' }}>support@newmahadevgaming.com</p>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Link to="/" style={{ color: '#555', fontSize: '12px', textDecoration: 'none' }}>← Back to Home</Link>
      </div>
    </div>
  )
}
