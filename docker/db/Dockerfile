# Use the official PostgreSQL image as the base
FROM postgres:15

# Install locales package and generate the Thai locale
RUN apt-get update && apt-get install -y locales \
    && sed -i '/th_TH.UTF-8/s/^# //g' /etc/locale.gen \
    && locale-gen th_TH.UTF-8

# Set the default locale environment variables
ENV LANG th_TH.UTF-8  
ENV LANGUAGE th_TH.UTF-8  
ENV LC_ALL th_TH.UTF-8

# Set the default command to run PostgreSQL
CMD ["postgres"]
