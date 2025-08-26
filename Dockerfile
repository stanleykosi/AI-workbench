FROM temporalio/auto-setup:1.22.3

# Expose Temporal ports
EXPOSE 7233

# Set environment variables for Railway PostgreSQL
ENV DB=postgres12
ENV DB_PORT=5432
ENV POSTGRES_USER=postgres
ENV POSTGRES_PWD=tWmklzipnzqQDwIUagWuXMrIcfgkPFgs
ENV POSTGRES_DB=railway
ENV POSTGRES_SEEDS=postgres.railway.internal

# The temporalio/auto-setup image will automatically use these environment variables
# to connect to Railway's PostgreSQL service
