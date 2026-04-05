FROM php:8.2-apache

# Install system dependencies + PHP MySQL extension
RUN apt-get update && apt-get install -y \
    unzip git curl \
    && docker-php-ext-install pdo pdo_mysql \
    && a2enmod rewrite \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- \
    --install-dir=/usr/local/bin --filename=composer

# Allow .htaccess overrides
RUN sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

WORKDIR /var/www/html

# Copy backend source
COPY . .

# Install PHP dependencies
RUN composer install --no-interaction --prefer-dist

EXPOSE 80

# Start Apache (migration is run separately via docker-compose exec or entrypoint)
CMD ["apache2-foreground"]
