import re
import base64
import hashlib
import urllib.parse
from typing import Dict, Any, List, Optional
import dns.resolver
from bs4 import BeautifulSoup
import requests

class EmailSecurityScanner:
    """
    Unified Email Security Scanner for domain authentication,
    link phishing analysis, and attachment threat evaluation.
    """

    def __init__(self, vt_api_key: Optional[str] = None):
        self.vt_api_key = vt_api_key
        self.vt_api_endpoint = "https://www.virustotal.com/vtapi/v2/file/report"
        self.resolver = dns.resolver.Resolver()
        self.resolver.lifetime = 2.5
        self.resolver.timeout = 2.0
        self._cache_spf: Dict[str, Dict[str, Any]] = {}
        self._cache_dkim: Dict[str, Dict[str, Any]] = {}
        self._cache_dmarc: Dict[str, Dict[str, Any]] = {}

    @staticmethod
    def extract_domain_from_email(email_str: str) -> Optional[str]:
        """Extract domain from an email address string."""
        if not email_str:
            return None
        match = re.search(r'@([a-zA-Z0-9.-]+)', email_str)
        return match.group(1).lower() if match else None

    def analyze_spf(self, domain: str) -> Dict[str, Any]:
        """Analyze SPF record for a domain with caching."""
        if domain in self._cache_spf:
            return self._cache_spf[domain]
        res = self._do_analyze_spf(domain)
        self._cache_spf[domain] = res
        return res

    def _do_analyze_spf(self, domain: str) -> Dict[str, Any]:
        """Analyze SPF record for a domain."""
        try:
            answers = self.resolver.resolve(domain, 'TXT')
            spf_records = [txt.to_text().strip('"') for txt in answers if 'v=spf1' in txt.to_text()]

            if not spf_records:
                return {
                    'exists': False,
                    'score': 0,
                    'grade': 'F',
                    'details': 'SPF record not found.',
                    'issues': ['SPF record not published for domain.'],
                    'recommendations': ['Implement a valid SPF record (e.g. v=spf1 mx -all).']
                }

            spf_record = spf_records[0]
            score = 100
            issues = []
            recommendations = []

            if ' -all' in spf_record:
                score += 5
            elif ' ~all' in spf_record:
                score -= 20
                issues.append("Soft fail (~all) detected in SPF record.")
                recommendations.append("Use hard fail (-all) for strict enforcement.")
            elif ' ?all' in spf_record or ' +all' in spf_record:
                score -= 50
                issues.append("Neutral (?all) or permissive (+all) SPF fail policy.")
                recommendations.append("Enforce policy with hard fail (-all).")
            else:
                score -= 40
                issues.append("No fail mechanism specified in SPF record.")
                recommendations.append("Specify a fail mechanism such as '-all'.")

            lookup_count = len(re.findall(r'(include|a|mx|ptr|exists):', spf_record))
            if lookup_count > 10:
                score -= 30
                issues.append(f"Excessive DNS lookups in SPF record ({lookup_count} lookups).")
                recommendations.append("Reduce the number of DNS lookups to comply with the 10-lookup limit.")

            score = max(0, min(100, score))
            grade = 'A' if score >= 90 else 'B' if score >= 80 else 'C' if score >= 70 else 'D' if score >= 60 else 'F'

            return {
                'exists': True,
                'score': score,
                'grade': grade,
                'record': spf_record,
                'issues': issues,
                'recommendations': recommendations
            }
        except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN):
            return {
                'exists': False,
                'score': 0,
                'grade': 'F',
                'details': 'Domain or TXT record does not exist.',
                'issues': ['Domain does not resolve TXT records.'],
                'recommendations': ['Verify DNS configuration.']
            }
        except Exception as e:
            return {
                'exists': False,
                'score': 0,
                'grade': 'F',
                'details': str(e),
                'issues': [f"DNS query error: {str(e)}"],
                'recommendations': ['Check network connectivity and DNS server.']
            }

    def analyze_dkim(self, domain: str, selector: str = 'default') -> Dict[str, Any]:
        """Analyze DKIM record for a domain given a selector with caching."""
        cache_key = f"{selector}:{domain}"
        if cache_key in self._cache_dkim:
            return self._cache_dkim[cache_key]
        res = self._do_analyze_dkim(domain, selector)
        self._cache_dkim[cache_key] = res
        return res

    def _do_analyze_dkim(self, domain: str, selector: str = 'default') -> Dict[str, Any]:
        """Analyze DKIM record for a domain given a selector."""
        try:
            dkim_domain = f"{selector}._domainkey.{domain}"
            answers = self.resolver.resolve(dkim_domain, 'TXT')
            dkim_records = [txt.to_text().strip('"') for txt in answers if 'v=DKIM1' in txt.to_text() or 'p=' in txt.to_text()]

            if not dkim_records:
                return {
                    'exists': False,
                    'score': 0,
                    'grade': 'F',
                    'details': f"No DKIM record found for selector '{selector}'.",
                    'issues': [f"Selector '{selector}' has no published DKIM key."],
                    'recommendations': ['Publish a DKIM public key record.']
                }

            dkim_record = dkim_records[0]
            score = 100
            issues = []
            recommendations = []

            key_match = re.search(r'p=([A-Za-z0-9+/=]+)', dkim_record)
            if key_match:
                try:
                    key_data = base64.b64decode(key_match.group(1))
                    key_length = len(key_data) * 8
                    if key_length < 1024:
                        score -= 40
                        issues.append("Weak DKIM key strength (<1024 bits).")
                        recommendations.append("Use at least 2048-bit keys for DKIM.")
                    elif key_length < 2048:
                        score -= 20
                        issues.append("Moderate DKIM key strength (<2048 bits).")
                        recommendations.append("Upgrade to 2048-bit DKIM keys.")
                except Exception:
                    issues.append("Could not parse DKIM key length.")
            else:
                score -= 40
                issues.append("Public key (p=) missing from DKIM record.")

            score = max(0, min(100, score))
            grade = 'A' if score >= 90 else 'B' if score >= 80 else 'C' if score >= 70 else 'D' if score >= 60 else 'F'

            return {
                'exists': True,
                'score': score,
                'grade': grade,
                'record': dkim_record,
                'issues': issues,
                'recommendations': recommendations
            }
        except Exception:
            return {
                'exists': False,
                'score': 0,
                'grade': 'F',
                'details': f"DKIM record lookup failed for {selector}._domainkey.{domain}.",
                'issues': ['DKIM lookup failed or not found.'],
                'recommendations': ['Verify DKIM selector and record.']
            }

    def analyze_dmarc(self, domain: str) -> Dict[str, Any]:
        """Analyze DMARC record for a domain with caching."""
        if domain in self._cache_dmarc:
            return self._cache_dmarc[domain]
        res = self._do_analyze_dmarc(domain)
        self._cache_dmarc[domain] = res
        return res

    def _do_analyze_dmarc(self, domain: str) -> Dict[str, Any]:
        """Analyze DMARC record for a domain."""
        try:
            dmarc_domain = f"_dmarc.{domain}"
            answers = self.resolver.resolve(dmarc_domain, 'TXT')
            dmarc_records = [txt.to_text().strip('"') for txt in answers if 'v=DMARC1' in txt.to_text()]

            if not dmarc_records:
                return {
                    'exists': False,
                    'score': 0,
                    'grade': 'F',
                    'details': 'No DMARC record found.',
                    'issues': ['No DMARC policy configured.'],
                    'recommendations': ['Implement a DMARC policy (e.g. v=DMARC1; p=reject; rua=...).']
                }

            dmarc_record = dmarc_records[0]
            score = 100
            issues = []
            recommendations = []

            if 'p=reject' in dmarc_record:
                score += 10
            elif 'p=quarantine' in dmarc_record:
                score -= 20
                issues.append("DMARC policy set to quarantine instead of reject.")
                recommendations.append("Strengthen policy to 'p=reject'.")
            elif 'p=none' in dmarc_record:
                score -= 50
                issues.append("DMARC policy set to none (monitoring only, no enforcement).")
                recommendations.append("Progress to 'p=quarantine' then 'p=reject'.")

            if 'rua=' not in dmarc_record:
                score -= 10
                issues.append("No aggregate reporting URI (rua) specified.")
                recommendations.append("Specify rua=mailto:... for monitoring.")

            score = max(0, min(100, score))
            grade = 'A' if score >= 90 else 'B' if score >= 80 else 'C' if score >= 70 else 'D' if score >= 60 else 'F'

            return {
                'exists': True,
                'score': score,
                'grade': grade,
                'record': dmarc_record,
                'issues': issues,
                'recommendations': recommendations
            }
        except Exception:
            return {
                'exists': False,
                'score': 0,
                'grade': 'F',
                'details': 'DMARC record lookup failed.',
                'issues': ['DMARC record not found.'],
                'recommendations': ['Configure DMARC for your domain.']
            }

    def analyze_links(self, email_body: str) -> Dict[str, Any]:
        """Analyze links inside the email body for suspicious or phishing indicators."""
        if not email_body:
            return {"total_links": 0, "suspicious_links": [], "risk_score": 0}

        soup = BeautifulSoup(email_body, 'html.parser')
        links = soup.find_all('a')
        raw_urls = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', email_body)
        
        all_hrefs = set()
        for link in links:
            href = link.get('href')
            if href:
                all_hrefs.add(href)
        for url in raw_urls:
            all_hrefs.add(url)

        suspicious_links = []
        for href in all_hrefs:
            reasons = []
            # IP address in URL
            if re.search(r'https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', href):
                reasons.append("Direct IP address used instead of domain")

            # Check parsed host
            try:
                parsed = urllib.parse.urlparse(href if href.startswith(('http://', 'https://')) else 'http://' + href)
                host = parsed.netloc.lower()
                
                # Check for popular brand spoofing
                for brand in ['paypal', 'google', 'apple', 'microsoft', 'amazon', 'netflix', 'chase']:
                    if brand in host and not (host.endswith(f".{brand}.com") or host == f"{brand}.com"):
                        reasons.append(f"Potential brand spoofing of '{brand}'")
                
                # Suspicious TLDs
                if re.search(r'\.(xyz|tk|ml|ga|cf|top|work|click|country)$', host):
                    reasons.append(f"High-risk top level domain: .{host.split('.')[-1]}")
            except Exception:
                pass

            if reasons:
                suspicious_links.append({
                    "url": href,
                    "reasons": reasons
                })

        risk_score = min(100, len(suspicious_links) * 25)
        return {
            "total_links": len(all_hrefs),
            "suspicious_links": suspicious_links,
            "risk_score": risk_score
        }

    def scan_file_hash_virustotal(self, file_bytes: bytes, filename: str) -> Dict[str, Any]:
        """Check file SHA-256 hash against VirusTotal API."""
        if not self.vt_api_key:
            return {
                "filename": filename,
                "status": "unscanned",
                "details": "VirusTotal API key not configured.",
                "positives": 0,
                "total": 0
            }

        try:
            file_hash = hashlib.sha256(file_bytes).hexdigest()
            params = {'apikey': self.vt_api_key, 'resource': file_hash}
            response = requests.get(self.vt_api_endpoint, params=params, timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('response_code') == 1:
                    positives = result.get('positives', 0)
                    total = result.get('total', 0)
                    status = "safe" if positives == 0 else "suspicious" if positives <= 2 else "unsafe"
                    return {
                        "filename": filename,
                        "hash": file_hash,
                        "status": status,
                        "details": f"{positives}/{total} security vendors flagged this file.",
                        "positives": positives,
                        "total": total
                    }
                else:
                    return {
                        "filename": filename,
                        "hash": file_hash,
                        "status": "safe",
                        "details": "No known threat detections in VirusTotal database.",
                        "positives": 0,
                        "total": 0
                    }
            elif response.status_code == 204:
                return {
                    "filename": filename,
                    "status": "unscanned",
                    "details": "VirusTotal API rate limit reached.",
                    "positives": 0,
                    "total": 0
                }
        except Exception as e:
            return {
                "filename": filename,
                "status": "unscanned",
                "details": f"Scanner error: {str(e)}",
                "positives": 0,
                "total": 0
            }

        return {
            "filename": filename,
            "status": "unscanned",
            "details": "VirusTotal lookup inconclusive.",
            "positives": 0,
            "total": 0
        }

    def analyze_email(
        self,
        sender: str,
        body: str = "",
        attachments: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Comprehensive security analysis combining domain authentication,
        body link inspection, and attachment safety.
        """
        domain = self.extract_domain_from_email(sender) or "unknown"
        
        # 1. DNS Authentication
        spf_res = self.analyze_spf(domain) if domain != "unknown" else {'score': 0, 'grade': 'F'}
        dkim_res = self.analyze_dkim(domain) if domain != "unknown" else {'score': 0, 'grade': 'F'}
        dmarc_res = self.analyze_dmarc(domain) if domain != "unknown" else {'score': 0, 'grade': 'F'}

        domain_auth_score = (
            spf_res.get('score', 0) * 0.35 +
            dkim_res.get('score', 0) * 0.25 +
            dmarc_res.get('score', 0) * 0.40
        )

        # 2. Body URL analysis
        link_analysis = self.analyze_links(body)
        link_penalty = link_analysis['risk_score'] * 0.5  # up to 50 pts penalty

        # 3. Attachment scanning
        attachment_results = {}
        attachment_penalty = 0
        if attachments:
            for att in attachments:
                fname = att.get('filename', 'attachment')
                fbytes = att.get('content', b'')
                res = self.scan_file_hash_virustotal(fbytes, fname)
                attachment_results[fname] = res
                if res['status'] == 'unsafe':
                    attachment_penalty += 50
                elif res['status'] == 'suspicious':
                    attachment_penalty += 20

        # Calculate final overall score (0 to 100)
        overall_score = max(0, min(100, int(domain_auth_score - link_penalty - attachment_penalty)))

        overall_grade = (
            'A' if overall_score >= 85
            else 'B' if overall_score >= 70
            else 'C' if overall_score >= 55
            else 'D' if overall_score >= 40
            else 'F'
        )

        status_text = (
            'Secure' if overall_score >= 80
            else 'Warning' if overall_score >= 60
            else 'Critical'
        )

        status_color = (
            '#16a34a' if overall_score >= 80
            else '#ea580c' if overall_score >= 60
            else '#dc2626'
        )

        status_bg_color = (
            '#dcfce7' if overall_score >= 80
            else '#fff7ed' if overall_score >= 60
            else '#fee2e2'
        )

        status_img_src = (
            'https://media.marka-img.com/bf85e0d6/check.png' if overall_score >= 80
            else 'https://media.marka-img.com/bf85e0d6/warning.png' if overall_score >= 60
            else 'https://media.marka-img.com/bf85e0d6/error.png'
        )

        return {
            'email': sender,
            'domain': domain,
            'overall_score': overall_score,
            'overall_grade': overall_grade,
            'status_text': status_text,
            'status_color': status_color,
            'status_bg_color': status_bg_color,
            'status_img_src': status_img_src,
            'spf': spf_res,
            'dkim': dkim_res,
            'dmarc': dmarc_res,
            'links': link_analysis,
            'attachments': attachment_results,
            'threats_detected': (overall_score < 70 or len(link_analysis['suspicious_links']) > 0 or attachment_penalty > 0)
        }
