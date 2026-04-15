import type { ProcessResultItem, ProcessStatus } from '../types/process'

interface CropResultListProps {
  results: ProcessResultItem[]
  status: ProcessStatus
}

export function CropResultList({ results, status }: CropResultListProps) {
  const hasNoResultsAfterRun = status === 'success' && results.length === 0

  return (
    <section className="panel panel--results">
      <div className="panel__intro panel__intro--results">
        <div>
          <p className="section-label">Results</p>
          <h2>Saved crops</h2>
        </div>
        <div className="results-actions">
          <p className="help-text">{results.length === 0 ? 'No result items to display yet.' : `${results.length} item${results.length === 1 ? '' : 's'} returned`}</p>
        </div>
      </div>
      {results.length === 0 ? (
        <div className="results-empty-state">
          <p className="results-empty-state__title">{hasNoResultsAfterRun ? 'No matches found' : 'Nothing to review yet'}</p>
          <p className="help-text">
            {hasNoResultsAfterRun
              ? 'No matching faces were found in this run. Try lowering Threshold to make matching less strict, then run the search again.'
              : 'Run the search to inspect saved paths, match scores, and preview crops here.'}
          </p>
        </div>
      ) : (
        <ol className="result-list">
          {results.map((result) => (
            <li key={`${result.sourceFilename}-${result.savedPath}`} className="result-card">
              {result.previewUrl ? (
                <div className="result-card__media">
                  <img className="result-card__image" src={result.previewUrl} alt={`Preview for ${result.sourceFilename}`} />
                </div>
              ) : (
                <div className="result-card__media result-card__media--empty">
                  <span>No preview</span>
                </div>
              )}
              <div className="result-card__content">
                <div className="result-card__header">
                  <div>
                    <p className="section-label">Source file</p>
                    <h3 className="result-card__title">{result.sourceFilename}</h3>
                  </div>
                  {result.matchScore !== null && result.matchScore !== undefined ? (
                    <div className="result-chip">
                      <span className="result-chip__label">Score</span>
                      <strong>{result.matchScore.toFixed(4)}</strong>
                    </div>
                  ) : null}
                </div>

                <dl className="result-meta-grid">
                  <div className="result-meta-grid__item result-meta-grid__item--full">
                    <dt>Saved path</dt>
                    <dd className="code-text">{result.savedPath}</dd>
                  </div>
                  {result.faceBox ? (
                    <div className="result-meta-grid__item result-meta-grid__item--full">
                      <dt>Face box</dt>
                      <dd>
                        top {result.faceBox.top}, right {result.faceBox.right}, bottom {result.faceBox.bottom}, left {result.faceBox.left}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
