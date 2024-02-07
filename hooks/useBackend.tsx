import { BACKEND_URL } from "@/constants/urls";

export const useBackend = () => {
  const getServices = async () => {
    fetch(`${BACKEND_URL}/services`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => console.log(data));
  };

  const getServiceVars = async (serviceHash: string) => {
    fetch(`${BACKEND_URL}/services/${serviceHash}/vars`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => console.log(data));
  };

  const getServiceKeys = async (serviceHash: string) => {
    fetch(`${BACKEND_URL}/services/${serviceHash}/keys`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => console.log(data));
  };

  const buildService = async (serviceHash: string) => {
    fetch(`${BACKEND_URL}/services/${serviceHash}/build`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => console.log(data));
  };

  const deleteService = async (serviceHash: string) => {
    fetch(`${BACKEND_URL}/services/${serviceHash}/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => console.log(data));
  };

  const startService = async (serviceId: number) => {
    fetch(`${BACKEND_URL}/services/${serviceId}/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => console.log(data));
  };

  const stopService = async (serviceId: number) => {
    fetch(`${BACKEND_URL}/services/${serviceId}/stop`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => console.log(data));
  };

  return {
    getServices,
    getServiceVars,
    getServiceKeys,
    buildService,
    deleteService,
    startService,
    stopService,
  };
};
