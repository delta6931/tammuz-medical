import { buildMetadata, GraceySelectorPage } from "./shared";

export const metadata = buildMetadata("EN");

export default function Page() {
  return <GraceySelectorPage locale="EN" />;
}
