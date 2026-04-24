import React from "react";
import { PageWrapper } from "../components/common/pagewrapper";
import { ClientMediaCenter } from "../components/client management/clientmediacenter";

const ClientMediaCenterPage: React.FC = () => {
  return (
    <PageWrapper className="p-6 mx-2 my-6">
      <ClientMediaCenter />
    </PageWrapper>
  );
};

export default ClientMediaCenterPage;
