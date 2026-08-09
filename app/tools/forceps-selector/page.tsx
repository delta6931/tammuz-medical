import { buildMetadata, ForcepsSelectorPage } from "./shared";

export const metadata = buildMetadata("EN");

export default function Page() {
  return <ForcepsSelectorPage locale="EN" />;
}
