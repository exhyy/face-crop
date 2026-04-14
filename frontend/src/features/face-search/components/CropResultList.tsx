import type { ProcessResultItem } from '../types/process'

interface CropResultListProps {
  results: ProcessResultItem[]
}

export function CropResultList({ results }: CropResultListProps) {
  return (
    <section className="panel">
      <h2>Results</h2>
      {results.length === 0 ? (
        <p className="help-text">No result items to display yet.</p>
      ) : (
        <ol className="result-list">
          {results.map((result) => (
            <li key={`${result.sourceFilename}-${result.savedPath}`} className="result-item">
              <dl className="result-item__meta">
                <div>
                  <dt>Source filename</dt>
                  <dd>{result.sourceFilename}</dd>
                </div>
                <div>
                  <dt>Saved path</dt>
                  <dd>{result.savedPath}</dd>
                </div>
                {result.matchScore !== null && result.matchScore !== undefined ? (
                  <div>
                    <dt>Match score</dt>
                    <dd>{result.matchScore.toFixed(4)}</dd>
                  </div>
                ) : null}
                {result.faceBox ? (
                  <div>
                    <dt>Face box</dt>
                    <dd>
                      top {result.faceBox.top}, right {result.faceBox.right}, bottom {result.faceBox.bottom}, left {result.faceBox.left}
                    </dd>
                  </div>
                ) : null}
              </dl>
              {result.previewUrl ? (
                <img src={result.previewUrl} alt={`Preview for ${result.sourceFilename}`} />
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
