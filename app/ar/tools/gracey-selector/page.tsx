import { buildMetadata, GraceySelectorPage } from "../../../tools/gracey-selector/shared";

export const metadata = buildMetadata("AR");

export default function Page() {
  return <GraceySelectorPage locale="AR" />;
}
