import { buildMetadata, ToothNumberingPage } from "./shared";

export const metadata = buildMetadata("EN");

export default function Page() {
  return <ToothNumberingPage locale="EN" />;
}
