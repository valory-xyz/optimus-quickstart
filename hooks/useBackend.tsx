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

  const getKeys = async () => {
    fetch(`${BACKEND_URL}/keys`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => console.log(data));
  };

  const createKeys = async () => {
    fetch(`${BACKEND_URL}/keys`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => console.log(data));
  };

  const getVars = async (serviceId: number) => {
    fetch(`${BACKEND_URL}/vars/${serviceId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => console.log(data));
  };

  const startService = async (serviceId: number) => {
    fetch(`${BACKEND_URL}/start_service/${serviceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => console.log(data));
  };

  const stopService = async (serviceId: number) => {
    fetch(`${BACKEND_URL}/stop_service/${serviceId}`, {
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
    getKeys,
    createKeys,
    getVars,
    startService,
    stopService,
  };
};
