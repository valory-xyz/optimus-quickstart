import { BACKEND_URL } from "@/constants/urls";
import { BuildServiceResponse } from "@/types/BuildServiceResponse";

const getServices = async () =>
  fetch(`${BACKEND_URL}/services`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      let array: any = [];
      Object.keys(data).map((key) => {
        array.push({ ...data[key], hash: key });
      });
      return array;
    });

const getServiceVars = async (serviceHash: string) =>
  fetch(`${BACKEND_URL}/services/${serviceHash}/vars`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => data);

const getServiceKeys = async (serviceHash: string) =>
  fetch(`${BACKEND_URL}/services/${serviceHash}/keys`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      data;
    });

const buildService = async (
  serviceHash: string,
  rpc: string,
): Promise<BuildServiceResponse> =>
  fetch(`${BACKEND_URL}/services/${serviceHash}/build`, {
    method: "POST",
    body: JSON.stringify({ rpc }),
  })
    .then((response) => response.json())
    .then((data) => data);

const deleteService = async (serviceHash: string) =>
  fetch(`${BACKEND_URL}/services/${serviceHash}/delete`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => data);

const startService = async (serviceHash: string) =>
  fetch(`${BACKEND_URL}/services/${serviceHash}/start`, {
    method: "POST",
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    });

const stopService = async (serviceHash: string) =>
  fetch(`${BACKEND_URL}/services/${serviceHash}/stop`, {
    method: "POST",
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    });

const ServicesService = {
  getServices,
  getServiceVars,
  getServiceKeys,
  buildService,
  deleteService,
  startService,
  stopService,
};

export default ServicesService;
