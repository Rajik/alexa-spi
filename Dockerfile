FROM amazonlinux

RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.6/install.sh | bash
RUN /bin/bash -c "source /root/.nvm/nvm.sh; nvm install 6.11.5"

CMD /bin/bash -c "source /root/.nvm/nvm.sh; nvm use 6.11.5"
