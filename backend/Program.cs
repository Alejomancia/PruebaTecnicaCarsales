var builder = WebApplication.CreateBuilder(args);

// Config
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
        policy => policy.WithOrigins("http://localhost:4200")
                        .AllowAnyHeader()
                        .AllowAnyMethod());
});


builder.Services.AddHttpClient("RickAndMorty", client =>
{
    client.BaseAddress = new Uri(builder.Configuration.GetValue<string>("RickAndMortyApi:BaseUrl") + "/");
    client.DefaultRequestHeaders.Add("Accept", "application/json");
});



builder.Services.AddScoped<IRickAndMortyClient, RickAndMortyClient>();
builder.Services.AddScoped<IEpisodesService, EpisodesService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors(MyAllowSpecificOrigins);
app.UseAuthorization();
app.MapControllers();
app.Run();
