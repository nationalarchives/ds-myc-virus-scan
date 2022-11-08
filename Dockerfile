FROM public.ecr.aws/lambda/nodejs:14

RUN yum update -y \
    && yum install -y amazon-linux-extras \
    && amazon-linux-extras install epel \
    && yum -y install clamav clamd \
    && yum clean all \
    && ln -s /etc/freshclam.conf /tmp/freshclam.conf

RUN freshclam

RUN clamscan --version

COPY handler.js ./

CMD ["handler.virusScan"]