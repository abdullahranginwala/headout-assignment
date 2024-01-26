# Headout Assignment - Abdullah Ranginwala

## Optimizations

### LRU Cache Implementation
In order to improve the efficiency of file access, I have utilised a simple LRU cache mechanism. This cache is designed to store recently accessed lines from text files in memory. While I initialially considered Redis, an in-memory cache seems a more practical approach considering the scope of the project and the overheads redis has. The LRU cache has a maximum capacity of 320,000 lines.

Cache Size Calculation
I wanted approximately 100mb for cache (size of 1 entire document). To determine the appropriate cache size, a rough estimation is made based on the assumption that each line in the text file has an average of 300 characters, and each character is represented by 1 bytes. The calculation is as follows:

`Cache Size (bytes) = Number of Lines * Characters per Line * Bytes per Character
                   = 320,000 * 300 * 1
                   = approximately 100mb
`

### Buffered Stream for File Transmission
When serving the entire text file to the client, I have utilized a buffered stream to enhance the transmission efficiency.

## Dev setup
For dev purposes, I have utilised 30 files each around 10-15mb.

You can find the docker image for this project at: https://hub.docker.com/r/abdullahranginwala/headout-assignment

The docker image has support for multiple architectures (ARM, x86)