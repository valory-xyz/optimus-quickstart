```ts
ServiceHash: string

ServiceUpdateTemplate {
    old: ServiceHash;
    new: ServiceTemplate;
}
```

* Get the list of available services
```js
GET /api/services -> Services
```

* Create a new service from template
```js
POST /api/services -> ServiceTemplate -> Services
```

* Update a service template
```js
PUT /api/services -> ServiceUpdateTemplate -> Services
```

* Delete services
```js
DELETE /api/services -> Array<ServiceHash> -> Array<ServiceHash>
```

* Get a service
```js
GET /api/services/{ServiceHash} -> Services
```

* Start a service
```js
POST /api/services/{ServiceHash}/deploy -> Deployment
```

* Stop a service
```js
POST /api/services/{ServiceHash}/stop -> Deployment
```

* Get deployment status
```js
POST /api/services/{ServiceHash}/status -> Deployment
```

* Update a service by hash
```js
PUT /api/services/{ServiceHash} -> ServiceUpdate -> Services
```

* Delete a service by hash
```js
DELETE /api/services/{ServiceHash} -> ServiceHash
```
