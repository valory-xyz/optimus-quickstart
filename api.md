```ts
ServiceHash: string

ServiceUpdateTemplate {
    old: ServiceHash;
    new: ServiceTemplate;
}
```

* Get the list of available services
```js
GET /api/services -> ServicesType
```

* Create a new service from template
```js
POST /api/services -> ServiceTemplate -> ServiceType
```

* Update a service template
```js
PUT /api/services -> ServiceUpdateTemplate -> ServiceType
```

* Delete services
```js
DELETE /api/services -> Array<ServiceHash> -> Array<ServiceHash>
```

* Get a service
```js
GET /api/services/{ServiceHash} -> ServicesType
```

* Start a service
```js
POST /api/services/{ServiceHash}/deploy -> DeploymentType
```

* Stop a service
```js
POST /api/services/{ServiceHash}/stop -> DeploymentType
```

* Get deployment status
```js
POST /api/services/{ServiceHash}/status -> DeploymentType
```

* Update a service by hash
```js
PUT /api/services/{ServiceHash} -> ServiceUpdate -> ServiceType
```

* Delete a service by hash
```js
DELETE /api/services/{ServiceHash} -> ServiceHash
```
