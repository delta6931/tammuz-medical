import { buildMetadata, ClinicSetupPage } from "./shared";

export const metadata = buildMetadata("EN");

export default function Page() {
  return <ClinicSetupPage locale="EN" />;
}
