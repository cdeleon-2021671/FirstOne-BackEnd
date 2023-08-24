# Características del proyecto

El proyecto está dividido por una parte de lógica y otra parte de configuración.

## Configuración

En esta parte se inicia el servidor, se hace la conexión a la base de datos y se crean por defecto las tiendas con sus productos a mostrar.

### index.js

- Se utiliza la dependencia **dotenv** para indicarle al programa que haremos uso de las variables de entorno que se almacenan en el archivo **.env**
- Se ejecuta la función que levanta el servidor en express
- Se ejecuta la función que hace la conexión a la base de datos

### Variables de entorno

Las variables de desarrollo se encuentran en el archivo **.env**, las cuales son:

- **PORT:** para el puerto en express
- **URI_MONGO_LOCAL:** para la conexión de la base de datos de forma local
- **MOLVU:** contiene el xml de la tienda MOLVU
- **VIVALDI:** contiene el xml de la tienda VIVALDI

Además, las variables de producción están en el archivo **.env.prod** el cual contiene la url de la conexión a la base de datos de forma remota:

- **URI_MONGO**

### mongo.js

- Utiliza la dependencia **dotenv** con la instrucción que debe utilizar las variables de entorno de producción
- Utiliza la dependencia **mongoose** y se exporta la función que conectará a la base de datos

### app.js

Se importan dependencias para configurar de manera segura y eficaz el servidor, por ejemplo:

- **Express**: crear y levantar el servidor
- **Cors**: hacer que se pueda utilizar desde el front
- **Morgan**: utilizar el entorno "dev" para mejorar el desarrollo ante las consultas
- **Helmet**: brindar seguridad para nuestras api

Se hace uso de cada dependencia utilizando su función. Con la función de express le asigna un puerto utilizando las variables de entorno

##

Se importan las rutas que serán utilizadas y se les asgina una ruta raíz, por ejemplo:

```
app.use("/store", storeRoutes);
```

En donde **storeRoutes** contiene las demás rutas, para tener como resultado:

```
http://localhost:puerto/store/rutaHija
```

##

También se importa el controlador de la tienda para hacer uso de su función **addStoresDefault** y poder crear las tiendas al inciar el servidor. Si en dado caso ya estuvieran creadas no las creará

## Lógica

La funcionalidad está en la carpeta **src** que a su vez contiene carpetas con nombre de los modelos. Adentro de estos modelos hay tres archivos, uno para el modelo (model), uno para el controlador (controller) y otro para las rutas (routes).

### Modelo (name.model.js)

Contiene la estructura del esquema sobre como se almacenará la información en la base de datos. Además, cuando se crea un registo (sin importar de que modelo sea) mongoose le asigna automáticamente un ObjectId que es único e irrepetible

Al final se exporta el esquema en forma de modelo para que pueda ser utilizado por los controladores que lo importen.

El modelo se exporta de forma singular ya que mongoose se encarga de ponerlo en forma plural, por ejemplo:

```
module.exports = mongoose.model('Store', storeSchema);
```

En la base de datos aparecera como "stores"

### Controlador (name.controller.js)

Contiene todas las funciones que serviran para el buen desarrollo de la aplicación, puede que estas funciones sean exportadas para la creación de algún api o simplemente para ser utilizadas en otras funciones en el mismo archivo o en otro.

Se importa el modelo a utilizar para hacer consultas sobre ese modelo en la base de datos.

Contiene toda la funcionalidad con respecto a ese modelo, por ejemplo, un CRUD

### Rutas (name.routes.js)

Se utiliza el enrutador de express para poder declarar las rutas con su verbo correspondiente. Además, se importa el controlador a utilizar para poder hacer uso de las funciones cuando se ingrese a esa ruta.

Algunos verbos a utilizar son:

- **GET**
- **POST**
- **UPDATE**
- **DELETE**

Al final se exporta la constante que contiene el enrutaddor para luego en el app.js importar este archivo y utilizar el enrutador que contiene las rutas hijas

## Funcionalidad de **store**

### Modelo

Contiene el esquema de Tienda el cual está conformado por los siguientes datos:

- **xml**: string, no puede estar vacío y tiene que ser único en este modelo, es decir, no pueden haber dos xml iguales en dos tiendas.
- **urlStore**: string, no puede estar vacío y tiene que ser único en este modelo, es decir, no pueden haber dos url iguales en dos tiendas.
- **name**: string, no puede estar vacío y no importa si es único
- **phone**: string que puede estar vacío y no importa si es único
- **whatsapp**:string que puede estar vacío y no importa si es único
- **facebook**: string que puede estar vacío y no importa si es único
- **instagram**: string que puede estar vacío y no importa si es único
- **tiktok**: string que puede estar vacío y no importa si es único
- **messenger**: string que puede estar vacío y no importa si es único
- **shippingTerms**: string que puede estar vacío y no importa si es único
- **paymentOptions**: array, que puede estar vacío y no importa si es único

Tener en cuenta que para los datos que son **String** puede ingresar cualquier tipo de dato siempre y cuando esté en cadena. Es decir, puede entrar números, pero estos no servirán para hacer operaciones matemáticas (a menos que se casteen a **Integer**), también puede ingresar url, link, xml, arreglos, pero estos deben estar en cadena, por ejemplo:

```
"['item1', 'item2', 393, 'https://...']"
```

### Controlador

En este archivo se importa la función changeXML, addProducts y deleteProducts, además de la dependencia axios que nos servirá para poder extraer un recurso externo (el xml).

Algunas funciones son:

- **addStoreMolvu**: esta función no es utilizada para api, sino que es para añadir la tienda de MOLVU a la base de datos. Se utiliza el xml correspondiente y con la función **changeXML** se logra convertir el xml en formato JSON para luego obtener los datos necesarios y pasarlos a la función **addProducts** que se encargara de guardarlos en la base de datos. Se valida si ya existe alguna tienda con ese xml ya que tiene que ser unico entonces si ya existe enviará un mensaje indicando que fue lo que sucedió y si no hay error procederá a guardar la tienda a la base de datos
- **addStoreVivaldi**: esta función hace la misma funcionalidad que la anterior, pero es necesaria ya que algunos datos del xml, de la tienda y de los productos cambian.
- **addStoresDefault**: función que ejecuta a las dos funciones anterios y es exportada para que se pueda utilizar en el app.js, así cuando se levanta el servidor se ejecuta está función que a su vez ejecuta las dos funciones anteriores, entonces de esa manera hace que se creen las dos tiendas al inciar el servidor.
- **getStore**: está función no es utiliza en ningún api. Necesita un xml para mandar a traer a la base de datos la tienda que coincida con el xml mandado
- **deleteStore**: está función no es utiliza en ningún api. Necesita el id de la tienda a eliminar para mandar una consulta a la base de datos y el id del registro que coincida será eliminado. Después se mandará el id a la función **deleteProducts** para que elimine a todos los productos que coincidan con ese id ya que tienen un capo (storeId) con el cual se puede identificar la tienda
- **reloadMolvuVivaldi**: esta función si es utilizada en un api ya que sirve para eliminar y agregar nuevamente las tiendas. Se manda a buscar las dos tiendas con forme al xml utilizando la función **getStore** para luego mandar el id de ese registro en la función **deleteStore** y que puedan ser eliminados, después se vuelven a agregar utilizando las funciones **addStoreMolvu** y **addStoreVivaldi**

### Rutas

En este caso el único método a utilizar es **get** para declarar las rutas:

- **/test**: es una función que se crea al iniciar el proyecto para verificar que el modelo, controlador y las rutas entén funcionando bien. El api se utilizaría de la siguiente manera:

```
http://localhost:puerto/store/test
```

- **/reloadMolvuVivaldi**: es la ruta que utiliza la función para eliminar y agregar automáticamente las tiendas con solo ingresar a la ruta. El api se utilizaría de la siguiente manera:

```
http://localhost:puerto/store/reloadMolvuVivaldi
```

Se utiliza la raíz **store** ya que en el app colocamos que esa sería la raíz para poder utilizar estas rutas.

## Funcionalidad de **product**

### Modelo

Contiene el esquema de Producto el cual está conformado por los siguientes datos:

- **storeId**: ObjectId, no puede ser null ni otro tipo de dato, además, el id que se ingrese tiene que ser del modelo de Store
- **urlProduct**: string, no puede estar vacío y no importa si es único ya que varios productos tendrán la misma url de tienda
- **name**: string, no puede estar vacío y no importa si es único
- **description**: string, no puede estar vacío y no importa si es único
- **price**: number, no puede estar vacío, no importa si es único, además, no solo admite enteros sino también decimales
- **salePrice**: number, no puede estar vacío, no importa si es único, además, no solo admite enteros sino también decimales
- **saleStartDate**: string que puede estar vacío y no importa si es único. Se utilizó string ya que si se utilizaba Date sería un formato de fecha totalmente distinto y daría error por no ser el formato adecuado
- **saleEndDate**: string que puede estar vacío y no importa si es único. Se utilizó string ya que si se utilizaba Date sería un formato de fecha totalmente distinto y daría error por no ser el formato adecuado
- **categories**: string que puede estar vacío y no importa si es único
- **tags**: string que puede estar vacío y no importa si es único
- **stock**: string, que no puede estar vacío y no importa si es único
- **views**: number, que puede estar vacío, no importa si es único, además, siempre que se ingrese un nuevo producto ingresara por defecto con cero views
- **image**: string, que no puede estar vacío y no importa si es único. Se utilizó string aunque el dato que estaría ingresando es una url de alguna foto del producto

Tomar en cuenta que la referencia se puede omitir, pero se le da referencia para que al hacer una consulta de producto podamos ver también la información de la tienda a la que pertenece

### Controlador

En este archivo se importa el modelo de Producto y de Tienda

Algunas funciones son:

- **addProducts**: esta función no es utilizada para api, sino que es para añadir los productos a la base de datos. Se exporta la función para que el controlador de tienda pueda utilizarla y mandarle los productos a agregar según el xml
- **deleteProducts**: esta función no es utilizada para api, sino que es para eliminar los productos de la base de datos. Se exporta la función para que el controlador de tienda pueda utilizarla y mandarle el id de la tienda en donde desea eliminar los productos
- **getProducts**: esta función es utilizada para api ya que tiene la finalidad de traer de la base de datos todos los productos que están guardados
- **getProductById**: esta función es utilizada para api ya que tiene la finalidad de traer de la base de datos solo un producto a detalle. Para esto se necesita mandar el id por la ruta como un parametro del producto a buscar y extraerlo con el nombre del parametro. Por ejemplo: 
```
ruta => http://localhost:puerto/getProductById/:productId
```
```
extraer => const {productId} = req.params
```
o 
```
extraer => const nombre_de_constante = req.params.productId
```
- **getVivaldi**: esta función es utilizada para api ya que tiene la finalidad de traer de la base de datos todos los productos que sean de la tienda VIVALDI.
- **getMolvu** esta función es utilizada para api ya que tiene la finalidad de traer de la base de datos todos los productos que sean de la tienda MOLVU.
- **searchProducts**: Por el momento no tiene ninguna funcionalidad

### Rutas

En este caso el único método a utilizar es el **GET** para declarar las rutas: 

- **/getProducts**: ruta que se utiliza para poder traer todos los productos de la base de datos
- **/getVivaldi**: ruta que se utiliza para poder traer todos los productos de vivaldi de la base de datos
- **/getMolvu**: ruta que se utiliza para poder traer todos los productos de molvu de la base de datos
- **/getProductById/:productId**: ruta que se utilizara para poder buscar un producto a detalle. Después de los dos puntos indica que es un parametro entonces en ese espacio de la ruta deberá ir un valor. Por ejemplo: 
```
ruta => http://localhost:puerto/getProductById/:productId
```
```
enviar valor => http://localhost:puerto/getProductById/123123123
```
- **/searchProducts**: ruta que se utilizará para poder traer todos los productos de la base de datos que coincidan o sean similares a la busqueda

## Funcionalidad de **conversion**

### Modelo

Contiene el esquema de Conversion el cual está conformado por los siguientes datos:

- **productId**: Mixed con referencia al modelo de Product. Esto se hace para que el dato pueda ser null u ObjectId ya que si lo colocamos como ObjectId no le podremos enviar datos vacíos. 
- **storeId**: ObjectId, no puede ser null ni otro tipo de dato, además, el id que se ingrese tiene que ser del modelo de Store
- **type**: string, puede estar vacío y no importa si es único
- **visitor**: string, puede estar vacío y no importa si es único
- **data**: string, puede estar vacío y no importa si es único

### Controlador

Por el momento no tiene ninguna funcionalidad

### Rutas

Por el momento no tiene ninguna funcionalidad