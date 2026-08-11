import { buildMetadata, ToolsIndexPage } from "./shared";

export const metadata = buildMetadata("EN");

export default function Page() {
  return <ToolsIndexPage locale="EN" />;
}
