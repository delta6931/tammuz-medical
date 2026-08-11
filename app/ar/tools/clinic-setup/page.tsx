import { buildMetadata, ClinicSetupPage } from "../../../tools/clinic-setup/shared";

export const metadata = buildMetadata("AR");

export default function Page() {
  return <ClinicSetupPage locale="AR" />;
}
