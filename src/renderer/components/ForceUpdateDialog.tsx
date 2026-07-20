import { Download, ExternalLink } from 'lucide-react';

interface ForceUpdateDialogProps {
  currentVersion: string;
  latestVersion: string;
  changelog: string;
  downloadUrl: string;
}

export function ForceUpdateDialog({ currentVersion, latestVersion, changelog, downloadUrl }: ForceUpdateDialogProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Download className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Update Required</h1>
        <p className="text-gray-600 mb-4">
          A new version of CopiaOS is available. Please update to continue.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">Current:</span>
            <span className="font-medium">{currentVersion}</span>
          </div>
          <div className="flex justify-between text-sm mb-3">
            <span className="text-gray-500">Latest:</span>
            <span className="font-medium text-primary-600">{latestVersion}</span>
          </div>
          {changelog && (
            <div>
              <p className="text-xs text-gray-500 mb-1">What's new:</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{changelog}</p>
            </div>
          )}
        </div>

        {downloadUrl ? (
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <ExternalLink className="w-4 h-4" /> Download Update
          </a>
        ) : (
          <p className="text-sm text-gray-500">Please contact your administrator for the update.</p>
        )}
      </div>
    </div>
  );
}
