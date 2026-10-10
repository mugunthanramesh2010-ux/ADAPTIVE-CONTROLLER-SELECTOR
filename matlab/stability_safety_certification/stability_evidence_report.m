function report = stability_evidence_report(A_cl, P, certStatus)
% STABILITY_EVIDENCE_REPORT Formats structured certificate for research audit
report = struct('Eigenvalues', eig(A_cl), 'LyapunovMatrix', P, ...
                'CertificateStatus', certStatus, 'Timestamp', char(datetime('now')));
end
