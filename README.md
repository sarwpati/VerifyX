# VerifyX: Secure Digital Certificate Issuance & Cryptographic Verification Network

> **4th-Year Major Capstone Project — Department of Computer Science & Engineering**  
> **Indian Institute of Information Technology Bhagalpur (IIIT Bhagalpur)**  
> **Technology Stack**: React 18, Node.js, Express, MongoDB, Asymmetric Ed25519 PKI, Merkle Trees, RFC 8785 JCS, PDF-Lib.

---

## 🌟 Executive Summary

**VerifyX** is an enterprise-grade, tamper-evident digital credential issuance and verification platform engineered to eliminate academic and professional credential fraud. 

Unlike standard final-year student projects that rely solely on basic database ID lookups, **VerifyX** implements a complete **Public Key Infrastructure (PKI)** with **Ed25519 asymmetric cryptographic signatures**, **RFC 8785 JSON Canonicalization (JCS)**, **Merkle Tree batch anchors**, and a **Dual Verification Portal** (real-time mobile QR code scanning and byte-level PDF Drag-and-Drop Tamper Inspection).

---

## 🏛️ System Architecture

```
+------------------------------------------------------------------------------------------------+
|                                    VERIFYX ARCHITECTURE                                        |
+------------------------------------------------------------------------------------------------+
|                                                                                                |
|   [ React 18 + Vite + Tailwind UI ]                                                           |
|     |-- Public Verification Portal (QR / ID / PDF Drag & Drop Inspector)                      |
|     |-- Organization Management Hub (Single/Batch CSV Issuance, Key Management, Revocation)   |
|     |-- Student Credential Locker (DigiLocker-style, 1-Click LinkedIn, Resumes)                |
|     +-- Admin Oversight & Security Dashboard (Org Vetting, Audit Logs, Fraud Detection)       |
|                                                                                                |
|   [ Express REST API & Security Gateway ]                                                     |
|     |-- Auth & RBAC (Admin, Organization, Student)                                             |
|     |-- Cryptographic Engine (Ed25519 PKI, Canonical JSON RFC 8785, SHA-256)                   |
|     |-- Merkle Tree Batch Processor (Merkle Root generation + Inclusion Proofs)                |
|     |-- PDF Rendering & Metadata Embedder (pdf-lib, QR injection, Anti-forgery stamps)        |
|     +-- Audit Logger & Verification Analytics (IP tracking, tamper detection)                 |
|                                                                                                |
|   [ Persistence & Storage ]                                                                   |
|     +-- MongoDB (Organizations, Certificates, Templates, Revocations, Audit Logs)             |
|     +-- Local / Memory Storage (Zero external dependencies needed for instant demo)           |
|                                                                                                |
+------------------------------------------------------------------------------------------------+
```

---

## 🚀 Key Engineering Differentiators

| Dimension | Typical Student Project | **VerifyX Platform** |
| :--- | :--- | :--- |
| **Tamper Resistance** | Vulnerable if DB is modified | **Mathematically Impossible to Forge**: Ed25519 signature fails if even 1 byte is altered in DB or PDF. |
| **Offline Verification** | Cannot verify without internet | **Offline Cryptographic Proof**: Signature & Public Key in PDF allow offline mathematical verification. |
| **Batch Issuance** | Issues 1 by 1 slowly | **Merkle Tree Binary Anchoring**: Upload CSV of 500+ students; computes Merkle Root & $O(\log N)$ inclusion proofs. |
| **Document Integrity** | Visual inspection only | **PDF Drag-and-Drop Inspector**: Computes SHA-256 checksum & flags post-issuance binary alterations. |
| **Standardization** | Non-standard arbitrary JSON | **RFC 8785 (JCS)**: Deterministic canonical JSON encoding across all platforms and runtimes. |
| **Student Ecosystem** | Static download link | **DigiLocker-style Locker** + 1-Click "Add to LinkedIn" certification integration + embeddable badges. |

---

## ⚡ Quick Start & Run Instructions

### 1. Prerequisites
- **Node.js** v18+ (Tested on v22.17.0)
- **npm** (Included with Node.js)

*(Note: MongoDB Memory Server is embedded automatically—no separate database server installation is required!)*

### 2. Install Dependencies
```bash
# In the project root:
npm run install-all
```

### 3. Start Application
```bash
# Runs both Backend (port 5000) and Frontend (port 5173) concurrently:
npm start
```
- **Frontend URL**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api`

---

## 🧪 Pre-Seeded Live Demo Credentials

Use the **1-Click Persona Switcher** on the website, or test with these pre-seeded accounts:

### 1. User Roles & Login Accounts (Password: `Password123!`)
| Role | Name | Email | Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | Security Administrator | `admin@verifyx.io` | Global audit logs, org vetting, fraud threat analytics |
| **Issuer (Academic)** | IIIT Bhagalpur Examination Cell | `registrar@iiitbh.ac.in` | Single/batch degree issuance, PKI key rotation, revocations |
| **Issuer (Enterprise)** | Google Cloud Academy | `credentials@googlecloud.academy` | Enterprise cloud certification issuance |
| **Student / Holder** | Aarav Sharma | `aarav.sharma@iiitbh.ac.in` | Credential locker (Roll: `220101001`), LinkedIn sharing |

### 2. Sample Certificate IDs for Live Verification
| Certificate ID | Status | Recipient | Test Scenario |
| :--- | :--- | :--- | :--- |
| **`VX-IIITBH-2026-1001`** | **VALID** | Aarav Sharma | Authentic B.Tech degree with 9.42 CGPA & Ed25519 signature |
| **`VX-IIITBH-2026-9999`** | **REVOKED** | Vikram Mehra | Demonstrates real-time revocation notice & audit proof |
| **`VX-GCA-2024-8888`** | **EXPIRED** | Priya Singh | Demonstrates automated certification expiry handling |
| **`VX-IIITBH-2026-3001`** | **BATCH ANCHORED** | Priya Singh | Demonstrates Merkle Tree batch inclusion proof |

---

## 🛡️ Viva & External Examiner Defense Cheat Sheet

### 1. "What prevents someone from updating marks directly in the database?"
> **Answer**: Even if an attacker gains root access to the MongoDB database and changes a student's CGPA from 6.0 to 9.8, the verification will **FAIL**. The system recalculates the SHA-256 hash over the canonical JSON payload (RFC 8785) and verifies the Ed25519 signature with the institution's public key. Because the attacker does not possess the organization's private key, the signature verification mathematically fails, triggering a red **TAMPER DETECTED** alert.

### 2. "Why choose Ed25519 over RSA-2048?"
> **Answer**: Ed25519 is an elliptic curve signature scheme (Edwards-curve Curve25519) providing 128-bit security equivalent to RSA-3072. It uses compact 32-byte public keys and 64-byte signatures, is immune to side-channel cache timing attacks, and is up to 20 times faster than RSA.

### 3. "How does the Merkle Tree batch issuance work?"
> **Answer**: When issuing 500 certificates at once via CSV, rather than signing 500 individual records separately, VerifyX hashes each certificate into a leaf node and constructs a binary Merkle Tree. The resulting Merkle Root is signed. An individual certificate can then be verified with logarithmic proof complexity $O(\log N)$ using only $\approx 9$ sibling hashes.

---

## 🎓 Academic Attribution

- **Project Title**: VerifyX — Secure Digital Certificate Issuance and Verification Platform
- **Institution**: Indian Institute of Information Technology Bhagalpur (IIIT Bhagalpur)
- **Degree Program**: Bachelor of Technology (B.Tech) — 4th-Year Major Capstone Project
