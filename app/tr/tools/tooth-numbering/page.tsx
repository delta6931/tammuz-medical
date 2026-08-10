import { buildMetadata, ToothNumberingPage } from "../../../tools/tooth-numbering/shared";

export const metadata = buildMetadata("TR");

export default function Page() {
  return <ToothNumberingPage locale="TR" />;
}
