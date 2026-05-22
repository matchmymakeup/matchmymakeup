// v2.1: /Profile route preserved as a thin redirect to /MyDNA (the renamed
// hub). Keeps any cached browser bookmarks / external links / stale
// hardcoded paths resolving cleanly during the transition.
import { Navigate } from 'react-router-dom';

export default function Profile() {
  return <Navigate to="/MyDNA" replace />;
}
