import { useNavigate } from "react-router-dom";
import { useCompare } from "../hooks/useCompare";
import { findProperty } from "../data/properties";

export default function CompareBar() {
  const navigate = useNavigate();
  const { ids, count, clear, toggle } = useCompare();
  if (count === 0) return null;

  return (
    <div className="compare-bar" role="region" aria-label="Compare selection">
      <div className="compare-bar__inner">
        <div className="compare-bar__chips">
          {ids.map((id) => {
            const p = findProperty(id);
            if (!p) return null;
            return (
              <button
                key={id}
                type="button"
                className="compare-bar__chip"
                onClick={() => toggle(id)}
                aria-label={`Remove ${p.name} from compare`}
              >
                <img src={p.pictures[0]} alt="" />
                <span className="compare-bar__chip-x" aria-hidden="true">×</span>
              </button>
            );
          })}
        </div>
        <div className="compare-bar__actions">
          <button type="button" className="link link--quiet" onClick={clear}>
            Clear
          </button>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => navigate("/compare")}
            disabled={count < 2}
          >
            Compare {count}
          </button>
        </div>
      </div>
    </div>
  );
}
