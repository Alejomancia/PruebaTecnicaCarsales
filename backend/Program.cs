var builder = WebApplication.CreateBuilder(args);

// Registro de controladores
builder.Services.AddControllers();

// Configuración de Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configuración de CORS para el frontend Angular
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        name: MyAllowSpecificOrigins,
        policy => policy
            .WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod()
    );
});

// HttpClient para la API de Rick and Morty
builder.Services.AddHttpClient("RickAndMorty", client =>
{
    client.BaseAddress = new Uri(
        builder.Configuration.GetValue<string>("RickAndMortyApi:BaseUrl") + "/"
    );
    client.DefaultRequestHeaders.Add("Accept", "application/json");
});

// Inyección de dependencias
builder.Services.AddScoped<IRickAndMortyClient, RickAndMortyClient>();
builder.Services.AddScoped<IEpisodesService, EpisodesService>();

var app = builder.Build();

// Swagger solo en ambiente de desarrollo
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Middleware global para manejo de errores
app.UseMiddleware<backend.Middlewares.ErrorHandlingMiddleware>();

app.UseHttpsRedirection();
app.UseCors(MyAllowSpecificOrigins);
app.UseAuthorization();

app.MapControllers();

app.Run();
