import { buildMetadata, ToothNumberingPage } from "../../../tools/tooth-numbering/shared";

export const metadata = buildMetadata("AR");

export default function Page() {
  return <ToothNumberingPage locale="AR" />;
}
