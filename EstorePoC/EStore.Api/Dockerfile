# ================================
# BUILD STAGE
# ================================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Force NuGet to use Linux-safe package path
ENV NUGET_PACKAGES=/root/.nuget/packages

# Copy csproj and restore first
COPY EStore.Api.csproj ./
RUN dotnet restore --no-cache

# Copy rest of the source
COPY . ./

# Publish
RUN dotnet publish -c Release -o /app/publish --no-restore

# ================================
# RUNTIME STAGE
# ================================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://0.0.0.0:${PORT}

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "EStore.Api.dll"]
